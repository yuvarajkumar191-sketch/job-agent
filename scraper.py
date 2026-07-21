import os, requests, feedparser, csv, io
from groq import Groq
from bs4 import BeautifulSoup
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

NOTION_TOKEN   = os.environ["NOTION_TOKEN"]
DATABASE_ID    = os.environ["NOTION_DATABASE_ID"]
ADZUNA_APP_ID  = os.environ.get("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY", "")
GROQ_API_KEY   = os.environ.get("GROQ_API_KEY", "")

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

CV_SUMMARY = """
Candidate: Shanmuka Bangari
Education: MBA Finance & Analytics (STEM), Hult International Business School London (graduating August 2026)
Previous: Credit Underwriter at HDFC Bank India - managed retail and agricultural loan portfolio of 400 crores.
Skills: Credit risk analysis, financial modelling, Python, SQL, Power BI, Tableau, Excel.
Looking for: Entry-level or graduate roles in credit risk, underwriting, banking, financial analysis, fintech.
Open to: UK (visa sponsorship needed), Netherlands (work permit), Singapore (work pass).
Target salary: 35000-55000 GBP or equivalent.
"""

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
SPONSOR_CSV_URL = "https://assets.publishing.service.gov.uk/media/6a588f229e631544544137be/SP_-_Worker_and_Temporary_Worker_Web_Register_-_2026-07-16.csv"
sponsor_set = set()

def load_sponsor_register():
    global sponsor_set
    if sponsor_set: return
    try:
        print("Loading Home Office sponsor register...")
        r = requests.get(SPONSOR_CSV_URL, timeout=30)
        reader = csv.DictReader(io.StringIO(r.text))
        for row in reader:
            name = row.get("Organisation Name","").strip().lower()
            if name:
                sponsor_set.add(name)
                for suffix in [" ltd"," limited"," plc"," llp"," inc"," group"," uk"]:
                    if name.endswith(suffix):
                        sponsor_set.add(name[:-len(suffix)].strip())
        print(f"Loaded {len(sponsor_set)} sponsor entries")
    except Exception as e:
        print(f"Sponsor register error: {e}")

def check_sponsor(company_name):
    if not sponsor_set: return "Unknown"
    name = company_name.strip().lower()
    if name in sponsor_set: return "Confirmed"
    for suffix in [" ltd"," limited"," plc"," llp"," inc"," group"," uk"," recruitment"," consulting"," solutions"]:
        if name.endswith(suffix):
            if name[:-len(suffix)].strip() in sponsor_set: return "Confirmed"
    for s in sponsor_set:
        if len(s) > 5 and s in name: return "Likely"
    return "Unknown"

def llm_score(title, company, description):
    if not groq_client: return fallback_score(title, description)
    try:
        prompt = (
            f"Score this job 1-10 for this candidate:\n"
            f"CV: {CV_SUMMARY}\n"
            f"Job Title: {title}\n"
            f"Company: {company}\n"
            f"Description: {description[:1000]}\n"
            "Reply ONLY in this format:\n"
            "SCORE: [1-10]\n"
            "REASON: [max 150 chars]\n"
            "SPONSOR: [YES/NO/UNKNOWN]"
        )
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role":"user","content":prompt}],
            max_tokens=100, temperature=0.1)
        text = response.choices[0].message.content.strip()
        score, reason, sponsor = 5, "LLM assessed", "Unknown"
        for line in text.split("\n"):
            line = line.strip()
            if line.startswith("SCORE:"):
                try: score = max(1, min(10, int(line.replace("SCORE:","").strip())))
                except: pass
            elif line.startswith("REASON:"):
                reason = line.replace("REASON:","").strip()[:200]
            elif line.startswith("SPONSOR:") and "YES" in line.upper():
                sponsor = "Likely"
        return score, reason, sponsor
    except Exception as e:
        print(f"  LLM error: {e}")
        return fallback_score(title, description)

STRONG = ["underwriter","underwriting","credit risk","credit analyst","mortgage","lending","risk analyst","financial analyst","banking","graduate scheme","entry level","associate","fintech","insurance"]
WEAK = ["senior","head of","director","vp ","vice president","managing director","partner","principal","chief"]
SPONSOR_KW = ["visa sponsorship","sponsorship available","skilled worker","tier 2","certificate of sponsorship","work permit","relocation","work pass"]

def fallback_score(title, desc):
    text = (title+" "+desc).lower()
    score, reasons = 0, []
    strong = [k for k in STRONG if k in text]
    if strong: score += min(len(strong)*2,6); reasons.append("Relevant: "+", ".join(strong[:3]))
    weak = [k for k in WEAK if k in text]
    if weak: score -= 3; reasons.append("Senior: "+", ".join(weak[:2]))
    if any(k in text for k in SPONSOR_KW): score += 2; reasons.append("Mentions sponsorship/relocation")
    if any(k in text for k in ["london","remote","hybrid","amsterdam","singapore"]): score += 1; reasons.append("Good location")
    sponsor = "Likely" if any(k in text for k in SPONSOR_KW) else "Unknown"
    return max(0,min(score,10)), "; ".join(reasons) or "No match", sponsor

def already_exists(url, title="", company=""):
    # Check by URL
    r = requests.post(f"https://api.notion.com/v1/databases/{DATABASE_ID}/query",
        headers=NOTION_HEADERS, json={"filter":{"property":"URL","url":{"equals":url}}})
    if len(r.json().get("results",[])) > 0: return True
    # Check by title+company
    if title and company:
        r2 = requests.post(f"https://api.notion.com/v1/databases/{DATABASE_ID}/query",
            headers=NOTION_HEADERS,
            json={"filter":{"and":[
                {"property":"Job Title","title":{"equals":title}},
                {"property":"company","rich_text":{"equals":company}}
            ]}})
        if len(r2.json().get("results",[])) > 0: return True
    return False

def add_to_notion(title, company, location, url, score, reason, source, salary="", sponsor="Unknown"):
    if already_exists(url, title, company): return False
    r = requests.post("https://api.notion.com/v1/pages", headers=NOTION_HEADERS,
        json={"parent":{"database_id":DATABASE_ID},"properties":{
            "Job Title":{"title":[{"text":{"content":title[:200]}}]},
            "company":{"rich_text":[{"text":{"content":company[:200]}}]},
            "Location":{"rich_text":[{"text":{"content":location[:200]}}]},
            "URL":{"url":url},
            "Fit score":{"number":score},
            "Notes":{"rich_text":[{"text":{"content":reason[:2000]}}]},
            "Source":{"select":{"name":source}},
            "Status":{"select":{"name":"New"}},
            "Visa sponsorship":{"select":{"name":sponsor}},
            "Date found":{"date":{"start":datetime.now(timezone.utc).date().isoformat()}},
        }})
    if r.status_code != 200: print(f"  Notion error: {r.json().get('message','')}"); return False
    return True

def scrape_reed():
    jobs = []
    for url in ["https://www.reed.co.uk/jobs/underwriter-jobs-in-london.rss","https://www.reed.co.uk/jobs/credit-risk-analyst-jobs-in-london.rss","https://www.reed.co.uk/jobs/credit-analyst-jobs-in-london.rss","https://www.reed.co.uk/jobs/banking-graduate-scheme-jobs.rss","https://www.reed.co.uk/jobs/mortgage-underwriter-jobs-in-london.rss"]:
        try:
            for e in feedparser.parse(url).entries:
                jobs.append((e.get("title",""),e.get("author","Unknown"),"London, UK",e.get("link",""),e.get("summary",""),"Reed",""))
        except: pass
    return jobs

def scrape_cv_library():
    jobs = []
    for url in ["https://www.cv-library.co.uk/jobs/underwriter/london?rss=1","https://www.cv-library.co.uk/jobs/credit-analyst/london?rss=1","https://www.cv-library.co.uk/jobs/credit-risk/london?rss=1","https://www.cv-library.co.uk/jobs/mortgage-underwriter/london?rss=1"]:
        try:
            for e in feedparser.parse(url).entries:
                jobs.append((e.get("title",""),"Unknown","London, UK",e.get("link",""),e.get("summary",""),"CV-Library",""))
        except: pass
    return jobs

def scrape_adzuna(country, location_label):
    if not ADZUNA_APP_ID: return []
    queries = ["underwriter","credit risk analyst","credit analyst","graduate scheme banking","mortgage underwriter"]
    jobs = []
    for q in queries:
        try:
            r = requests.get(f"https://api.adzuna.com/v1/api/jobs/{country}/search/1",
                params={"app_id":ADZUNA_APP_ID,"app_key":ADZUNA_APP_KEY,"results_per_page":20,"what":q,"content-type":"application/json","sort_by":"date"},timeout=15)
            r.raise_for_status()
            for j in r.json().get("results",[]):
                smin,smax = j.get("salary_min"),j.get("salary_max")
                jobs.append((j.get("title",""),j.get("company",{}).get("display_name","Unknown"),j.get("location",{}).get("display_name",location_label),j.get("redirect_url",""),j.get("description",""),f"Adzuna-{country.upper()}",f"£{int(smin):,}-£{int(smax):,}" if smin and smax else ""))
        except Exception as ex: print(f"Adzuna {country} error: {ex}")
    return jobs

def scrape_efinancialcareers():
    jobs = []
    hdrs = {"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36"}
    for url in ["https://www.efinancialcareers.co.uk/search/?q=underwriter&location=London","https://www.efinancialcareers.co.uk/search/?q=credit+risk+analyst&location=London","https://www.efinancialcareers.co.uk/search/?q=credit+analyst&location=London"]:
        try:
            soup = BeautifulSoup(requests.get(url,headers=hdrs,timeout=15).text,"html.parser")
            cards = soup.select("article[data-at='job-item']") or soup.select("[class*='JobCard']") or soup.select("li[class*='job']")
            for card in cards[:20]:
                ta = card.select_one("h2 a") or card.select_one("h3 a") or card.select_one("a[class*='title']")
                if not ta: continue
                title = ta.get_text(strip=True)
                link = ta.get("href","")
                if link and not link.startswith("http"): link = "https://www.efinancialcareers.co.uk"+link
                ca = card.select_one("[class*='company']")
                la = card.select_one("[class*='location']")
                jobs.append((title,ca.get_text(strip=True) if ca else "Unknown",la.get_text(strip=True) if la else "London",link,"","eFinancialCareers",""))
        except Exception as ex: print(f"eFC error: {ex}")
    return jobs

def run():
    MIN_SCORE = 4
    added = skipped = 0
    all_jobs = []
    load_sponsor_register()

    print("Scraping Reed (UK)...");            all_jobs += scrape_reed()
    print("Scraping CV-Library (UK)...");      all_jobs += scrape_cv_library()
    print("Scraping Adzuna UK...");            all_jobs += scrape_adzuna("gb", "United Kingdom")
    print("Scraping Adzuna Netherlands...");   all_jobs += scrape_adzuna("nl", "Netherlands")
    print("Scraping Adzuna Singapore...");     all_jobs += scrape_adzuna("sg", "Singapore")
    print("Scraping eFinancialCareers...");    all_jobs += scrape_efinancialcareers()

    seen_batch, unique = set(), []
    for job in all_jobs:
        key = f"{job[0].lower().strip()}|{job[1].lower().strip()}"
        if job[3] and key not in seen_batch:
            seen_batch.add(key); unique.append(job)

    print(f"\nTotal unique jobs: {len(unique)}")
    print(f"Scoring: {'Groq LLaMA AI' if groq_client else 'fallback'}")
    print("="*60)

    for job in unique:
        title, company, location, url, desc, source = job[:6]
        salary = job[6] if len(job) > 6 else ""
        print(f"Processing: {title} at {company} [{source}]")
        score, reason, llm_sponsor = llm_score(title, company, desc)
        ho_sponsor = check_sponsor(company)
        final_sponsor = "Confirmed" if ho_sponsor == "Confirmed" else ("Likely" if llm_sponsor == "Likely" or ho_sponsor == "Likely" else "Unknown")
        print(f"  Score {score}/10 | Sponsor: {final_sponsor} | {reason[:60]}")
        if score < MIN_SCORE:
            print(f"  Too low, skipping"); skipped += 1; continue
        if add_to_notion(title, company, location, url, score, reason, source, salary, final_sponsor):
            print(f"  Added!"); added += 1
        else:
            print(f"  Already exists"); skipped += 1

    print("="*60)
    print(f"Run complete. Added: {added} | Skipped: {skipped}")

if __name__ == "__main__":
    run()
