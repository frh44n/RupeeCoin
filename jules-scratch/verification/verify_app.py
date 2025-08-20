from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    context = browser.new_context()
    page = context.new_page()

    page.goto("http://localhost:3000/")

    # Wait for the initial loading message to disappear
    page.wait_for_selector("text=Connecting to Telegram...", state="hidden")

    # Now, wait for the actual form to appear
    page.wait_for_selector("text=Welcome to RupeeCoin")

    # Fill in the login form
    page.get_by_placeholder("Your Telegram ID").fill("12345")
    page.get_by_placeholder("Your first name").fill("Jules")
    page.get_by_role("button", name="Start Playing").click()

    # Wait for the main interface to load
    page.wait_for_selector("[data-testid='rupee-coin-button']")

    # Wait for animations to load
    page.wait_for_timeout(1000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/screenshot.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
