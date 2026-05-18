import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Set up console log event handler
        @page.on("console")
        def handle_console(msg):
            print(f"[CONSOLE {msg.type.upper()}] {msg.text}")

        # Set up page error handler
        @page.on("pageerror")
        def handle_pageerror(err):
            print(f"[PAGE ERROR] {err.message}")
            if err.stack:
                print(f"[STACK] {err.stack}")

        # Set up network request handler to check 404s
        @page.on("response")
        def handle_response(response):
            if response.status >= 400:
                print(f"[NETWORK ERROR] {response.status} {response.url}")

        print("Navigating to Vercel page...")
        try:
            await page.goto("https://minsukim-chp.vercel.app/post/rp9kdxSM106jjUte8zgx", wait_until="load", timeout=10000)
            print("Page loaded. Waiting 5 seconds for Firestore/scripts to execute...")
            await page.wait_for_timeout(5000)
        except Exception as e:
            print(f"Navigation error: {e}")

        # Get the innerText of the loading spinner
        spinner_text = await page.eval_on_selector("#loading-spinner", "el => el.innerText")
        print(f"\nFinal Loading Spinner Text: '{spinner_text}'")

        # Get post-container display status
        post_visible = await page.eval_on_selector("#post-container", "el => window.getComputedStyle(el).display")
        print(f"Post Container Display: '{post_visible}'")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
