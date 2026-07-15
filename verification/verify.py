from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 800})
        page = context.new_page()
        print("Navigating to homepage...")
        page.goto("http://localhost:3000", wait_until="networkidle")
        print("Taking screenshot...")
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Done!")
        browser.close()

if __name__ == "__main__":
    verify()
