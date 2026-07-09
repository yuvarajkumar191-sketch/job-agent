import os, requests, feedparser
from bs4 import BeautifulSoup
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

NOTION_TOKEN   = os.environ["NOTION_TOKEN"]
DATABASE_ID    = os.environ["NOTION_DATABASE_ID"]
ADZUNA_APP_ID  = os.environ.get("ADZUNA_APP_ID", "")
ADZUNA_APP_KEY = os.environ.get("ADZUNA_APP_KEY", "")

NOTION_HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28"
}

STRONG = ["underwriter","underwriting","credit risk","credit analyst",
          "credit underwriter","mortgage","loan","lending","risk analyst",
          "portfolio","financial analyst","banking","graduate scheme",
          "graduate programme","entry level","associate","fintech",
          "esg","sustainability","insurance","reinsurance","actuarial"]
WEAK   = ["senior","head of","director","vp ","vice president",
          "managing director"," md ","partner","principal","chief"]
SPONSOR= ["visa sponsorship","sponsorship available","sponsor","skilled worker",
          "tier 2","certificate of sponsorship","relocation package"]

def score_job(title, desc):
    text = (title + " " + desc).lower()
    score, reasons = 0, []
    strong = [k for k in STRONG if k in text]
    if strong:
        score += min(len(strong)*2, 6)
        reasons.append("Relevant: " + ", ".join(strong[:3]))
    weak = [k for k in WEAK if k in text]
    if weak:
        score -= 3
        reasons.append("Senior role: " + ", ".join(weak[:2]))
    sponsor_match = any(k in text for k in SPONSOR)
    if sponsor_match:
        score += 2; reasons.append("Mentions sponsorship")
    if any(k in text for k in ["london","remote","hybrid"," uk "]):
        score += 1; reasons.append("UK/London/Remote")
    return max(0, min(score, 10)), "; ".join(reasons) or "No strong match", sponsor_match

def already_exists(url):
    r = requests.post(
        f"https://api.notion.com/v1/databases/{DATABASE_ID}/query",
        headers=NOTION_HEADERS,
        json={"filter": {"property": "URL", "url": {"equals": url}}}
    )
    data = r.json()
    return len(data.get("results", [])) > 0

def add_to_notion(title, company, location, url, score, reason, source, salary="", sponsor=False):
    if already_exists(url): return False
    visa_status = "Likely" if sponsor else "Unknown"
    r = requests.post(
        "https://api.notion.com/v1/pages",
        headers=NOTION_HEADERS,
        json={
            "parent": {"database_id": DATABASE_ID},
            "properties": {
                "Job Title":        {"title": [{"text": {"content": title[:200]}}]},
                "company":          {"rich_text": [{"text": {"content": company[:200]}}]},
                "Location":         {"rich_text": [{"text": {"content": location[:200]}}]},
                "URL":              {"url": url},
                "Fit score":        {"number": score},
                "Notes":            {"rich_text": [{"text": {"content": reason[:2000]}}]},
                "Source":           {"select": {"name": source}},
                "Status":           {"select": {"name": "New"}},
                "Visa sponsorship": {"select": {"name": visa_status}},
                "Date found":       {"date": {"start": datetime.utcnow().date().isoformat()}},
            }
        }
    )
    if r.status_code != 200:
        print(f"  Notion error {r.status_code}: {r.json().get('message','')}")
        return False
    return True

def scrape_reed():
    feeds = [
        "https://www.reed.co.uk/jobs/underwriter-jobs-in-london.rss",
        "https://www.reed.co.uk/jobs/credit-risk-analyst-jobs-in-london.rss",
        "https://www.reed.co.uk/jobs/credit-analyst-jobs-in-london.rss",
        "https://www.reed.co.uk/jobs/banking-graduate-scheme-jobs.rss",
        "https://www.reed.co.uk/jobs/mortgage-underwriter-jobs-in-london.rss",
        "https://www.reed.co.uk/jobs/underwriting-jobs.rss",
    ]
    jobs = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for e in feed.entries:
                s, r, sp = score_job(e.get("title",""), e.get("summary",""))
                jobs.append((e.get("title",""), e.get("author","Unknown"),
                             "London, UK", e.get("link",""), s, r, "Reed", "", sp))
        except Exception as ex: print(f"Reed error: {ex}")
    return jobs

def scrape_cv_library():
    feeds = [
        "https://www.cv-library.co.uk/jobs/underwriter/london?rss=1",
        "https://www.cv-library.co.uk/jobs/credit-analyst/london?rss=1",
        "https://www.cv-library.co.uk/jobs/credit-risk/london?rss=1",
        "https://www.cv-library.co.uk/jobs/mortgage-underwriter/london?rss=1",
    ]
    jobs = []
    for url in feeds:
        try:
            feed = feedparser.parse(url)
            for e in feed.entries:
                s, r, sp = score_job(e.get("title",""), e.get("summary",""))
                jobs.append((e.get("title",""), "Unknown",
                             "London, UK", e.get("link",""), s, r, "CV-Library", "", sp))
        except Exception as ex: print(f"CV-Library error: {ex}")
    return jobs

def scrape_adzuna():
    if not ADZUNA_APP_ID:
        print("Adzuna: no key, skipping."); return []
    queries = [
        "underwriter london",
        "credit risk analyst london",
        "credit analyst banking london",
        "graduate scheme banking finance",
        "mortgage underwriter london",
        "insurance underwriter london",
    ]
    jobs = []
    base = "https://api.adzuna.com/v1/api/jobs/gb/search/1"
    for q in queries:
        try:
            r = requests.get(base, params={
                "app_id": ADZUNA_APP_ID, "app_key": ADZUNA_APP_KEY,
                "results_per_page": 20, "what": q, "where": "London",
                "distance": 30, "content-type": "application/json", "sort_by": "date"
            }, timeout=15)
            r.raise_for_status()
            for j in r.json().get("results", []):
                title   = j.get("title", "")
                link    = j.get("redirect_url", "")
                desc    = j.get("description", "")
                company = j.get("company", {}).get("display_name", "Unknown")
                loc     = j.get("location", {}).get("display_name", "London")
                smin    = j.get("salary_min")
                smax    = j.get("salary_max")
                salary  = f"£{int(smin):,}–£{int(smax):,}" if smin and smax else ""
                s, reason, sp = score_job(title, desc)
                jobs.append((title, company, loc, link, s, reason, "Adzuna", salary, sp))
        except Exception as ex: print(f"Adzuna error '{q}': {ex}")
    return jobs

def scrape_efinancialcareers():
    searches = [
        "https://www.efinancialcareers.co.uk/search/?q=underwriter&location=London",
        "https://www.efinancialcareers.co.uk/search/?q=credit+risk+analyst&location=London",
        "https://www.efinancialcareers.co.uk/search/?q=credit+analyst&location=London",
        "https://www.efinancialcareers.co.uk/search/?q=graduate+scheme+banking&location=London",
        "https://www.efinancialcareers.co.uk/search/?q=mortgage+underwriter&location=London",
    ]
    jobs = []
    hdrs = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
    for url in searches:
        try:
            soup = BeautifulSoup(
                requests.get(url, headers=hdrs, timeout=15).text, "html.parser")
            cards = (soup.select("article[data-at='job-item']") or
                     soup.select("div[data-cy='job-item']") or
                     soup.select("[class*='JobCard']") or
                     soup.select("li[class*='job']"))
            for card in cards[:20]:
                ta = (card.select_one("a[data-cy='job-title-link']") or
                      card.select_one("h2 a") or card.select_one("h3 a") or
                      card.select_one("a[class*='title']"))
                if not ta: continue
                title = ta.get_text(strip=True)
                link  = ta.get("href", "")
                if link and not link.startswith("http"):
                    link = "https://www.efinancialcareers.co.uk" + link
                ca = (card.select_one("[data-cy='company-name']") or
                      card.select_one("[class*='company']"))
                la = (card.select_one("[data-cy='location']") or
                      card.select_one("[class*='location']"))
                company  = ca.get_text(strip=True) if ca else "Unknown"
                location = la.get_text(strip=True) if la else "London"
                s, reason, sp = score_job(title, "")
                jobs.append((title, company, location, link, s, reason,
                             "eFinancialCareers", "", sp))
        except Exception as ex: print(f"eFC error: {ex}")
    return jobs

def run():
    MIN_SCORE = 3
    added = skipped = 0
    all_jobs = []

    print("Scraping Reed...");              all_jobs += scrape_reed()
    print("Scraping CV-Library...");        all_jobs += scrape_cv_library()
    print("Scraping Adzuna...");            all_jobs += scrape_adzuna()
    print("Scraping eFinancialCareers..."); all_jobs += scrape_efinancialcareers()

    seen, unique = set(), []
    for job in all_jobs:
        url = job[3]
        if url and url not in seen:
            seen.add(url); unique.append(job)

    print(f"\nTotal unique jobs found: {len(unique)}")
    print("="*60)

    for job in unique:
        title, company, location, url, score, reason, source = job[:7]
        salary  = job[7] if len(job) > 7 else ""
        sponsor = job[8] if len(job) > 8 else False
        print(f"Processing: {title} at {company}")
        if score < MIN_SCORE:
            print(f"  Score {score}/10 - too low, skipping")
            skipped += 1; continue
        if add_to_notion(title, company, location, url, score,
                         reason, source, salary, sponsor):
            print(f"  Added (score {score}/10) [{source}]")
            added += 1
        else:
            print(f"  Already exists"); skipped += 1

    print("="*60)
    print(f"Run complete. Added: {added} | Skipped/low-score: {skipped}")

if __name__ == "__main__":
    run()
