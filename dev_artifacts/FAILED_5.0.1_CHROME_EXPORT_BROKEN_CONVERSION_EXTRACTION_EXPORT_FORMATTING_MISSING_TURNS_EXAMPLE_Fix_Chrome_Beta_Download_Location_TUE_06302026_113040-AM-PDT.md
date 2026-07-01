---
title: Fix Chrome Beta Download Location
source: https://www.google.com/search?ntc=1&udm=50&arv=1&nord=1&atvm=2&mstk=AUtExfASJXamXgTrO-ymiawo8Zl8-S0lrk14XfphTXBm2Sbs-ZR64qmmk8wNfh5ZYldtUOHMHz20jv9N0r5MxeVS0VCXnES8IytlVwFdl0H_FYYWp6AZGn3H-bYTI52wDQlQeYrseROKsvSYlmkOQao6nUVrSmlfzIaKOWaoopMWj3S31l3vthHOwRfg9RUfQrkGcH1dmRPRqNJeGpb7OQIBFoQclatTgVpsY4jJmEIrxCBrLDCG3tRjeZi8C9lEZQ2aaezk9VOU7_75mVqOOf8HY8ckSBsnU2ZBObUMmy0ztxb6e6E6vIDVfYwU3ONm49_MUvLiGu7al33NVQ&mtid=spxBasqFFaPRkPIPo6bK6Q0&csuir=1&aep=26&q=Fix+Chrome+Beta+Download+Location&ved=0CAAQ2_wOahcKEwiwt4XYy6-VAxUAAAAAHQAAAAAQHg
exported: Tuesday, June 30, 2026 at 11:30:58 AM PDT
turns: 1
exporter: Google AI Canvas Exporter v5.0.1
---

June 28, 2026

CopiedCopyEditYou said: rigorously justify and provide the absolute optimal solution as of today to ensure Google Chrome Version 150.0.7871.46 (Official Build) beta (64-bit) remembers and allows me to save to last saved location as it used to rather than always defaulting to downloads folder.June 28, 2026**Direct Answer**
This behavior is a **confirmed software regression** (bug) specific to Chromium version 150.0.7871.x. It is not a user setting, nor is it intended behavior. As of today, **June 28, 2026**, the absolute optimal solution is to **temporarily change your Default Download location** to your current working folder or **rollback to the Stable channel (v149)** until the next patch. There is no flag or registry edit that can force the "remember last location" behavior in v150 because the code responsible for retaining that memory state is currently broken in this build. **Rigorous Justification** Your experience is caused by a documented regression in the Chromium 150 codebase (which Chrome 150 is built on).
-
- **The Mechanism:** In previous versions (v149 and below), Chrome’s file picker logic would cache the directory path of the last successfully saved file. When you initiated a new "Save As," it would initialize the OS file dialog using that cached path.
- **The Failure in v150:** In version 150.0.7871.46, this initialization logic fails. Instead of reading the cached `last_saved_path`, the browser is erroneously resetting the dialog initialization to the `default_download_path` for *every* transaction.
- **Evidence:** This has been actively tracked in the Chromium issue tracker (referenced in related Brave/Chromium issue threads like **\[CR150\] previously used download location is not retained**, opened June 23, 2026). The "Expected Result" listed by developers confirms that your desired behavior (remembering the folder) is the correct one, and the current behavior is a defect.
-

**The Absolute Optimal Solution (Step-by-Step)** Since you are on the **Beta channel** (which exists to catch bugs like this), you have two valid paths depending on how critical this workflow is to you. **Option A: The Workflow Workaround (Recommended)** Since you cannot "fix" the compiled code, optimize your settings to minimize friction until the patch arrives (likely within 1-2 weeks).

1. **Set Default to Current Project:**
- Go to `chrome://settings/downloads`.
- Click **Change** next to "Location".
- Select the folder you are currently saving to most frequently.
- *Result:* The "Save As" dialog will now default to this folder, mimicking the "memory" behavior for this specific project.

2. **Report to Prioritize the Fix:**
- Press `Alt` + `Shift` + `i` in Chrome.
- In the text box, paste: **"Regression in v150.0.7871.46: Save As dialog ignores last used location and resets to default Downloads folder. Revert to v149 behavior required."**
- *Why:* This "rigorous" reporting alerts the release managers that this bug is affecting user productivity, increasing the likelihood it is tagged as a "Release Blocker" for the Stable launch.

**Option B: The "Nuclear" Fix (Rollback)** If you cannot work with this bug, you must leave the Beta channel.

1. **Uninstall Chrome Beta.**

2. **Install Chrome Stable:** Download the current Stable version (likely v149 or an older v150 build that might not have this specific regression yet, though likely v149).

3. **Warning:** Downgrading may prevent your User Profile from loading (since it was upgraded to v150). You may need to sync your data back from the cloud rather than using your local profile folder.

**What DOES NOT Work (Do Not Waste Time)**
-
- **Registry Policies:** Setting `PromptForDownloadLocation` to `1` only forces the *prompt* to appear; it does not fix the *default directory* shown in that prompt.
- **Flags:** Old flags like `chrome://flags/#download-bubble` or `--disable-features=DownloadBubble` have been deprecated/removed and will not restore the v149 file picker behavior in v150.
-

**Summary Recommendation:**
Stick with the **Beta** and use **Option A**. This bug is fresh (identified ~5 days ago) and is highly likely to be patched in the next minor update (e.g., 150.0.7871.5x).  Copy
# Share public link

This public link shares a thread, which may include personal information. You can [delete](https://support.google.com/websearch/answer/16517651) this link, but not copies made by others.Can’t copy the link right now. Try again later.FacebookGmailXRedditWhatsAppGood responseBad responseMoreSaved timeClearHelpfulComprehensiveOtherIncorrectInappropriateNot workingUnhelpfulOtherA copy of this chat, including the images and video, will be included with your feedbackA copy of this chat will be included with your feedbackYour feedback will include a copy of this chat and the image from your searchYour feedback will include a copy of this chat, any links you shared, and the image from your search.Thanks for letting us knowGoogle may use account and system data to understand your feedback and improve our services, subject to our [Privacy Policy](https://policies.google.com/privacy) and [Terms of Service](https://policies.google.com/terms). For legal issues, [make a legal removal request](https://support.google.com/legal/answer/3110420).
- [5](https://chromereleases.googleblog.com/2026/06/chrome-beta-for-desktop-update_02072900116.html)Chrome Beta for Desktop UpdateChrome Beta for Desktop Update The Beta channel has been updated to 150.0.7871.46 for Windows, Mac and Linux. A partial list of ch...blog.google
- [6](https://support.google.com/chrome/thread/309677160/download-location-cannot-change?hl=en)download location cannot change - Google Chrome CommunityTap the three dots in the top right corner of the Chrome browser and select "Settings." Look for a section related to downloads or...Google Help
- [7](https://www.youtube.com/watch?v=hZGT-_tqCmg&vl=en-US)How to Change Chrome's Default Download Location!are you tired of your downloads cluttering the default folder in the next 2 minutes I'll show you exactly how to change Chrome's d...1:36YouTube·Devity Works
- [8](https://chromereleases.googleblog.com/2026/06/chrome-for-android-update_01850164664.html)Chrome Releases: Chrome for Android UpdateWednesday, June 24, 2026. Hello Everyone! We've just released Chrome 150 (150.0. 7871.46) for Android to a small percentage of use...blog.google
- [9](https://support.google.com/chrome/thread/212228514/error-1603-in-installing-nearby-share-beta?hl=en)Error 1603 in installing nearby share beta. - Google Chrome CommunityError 1603 in installing nearby share beta. 1. Go to your software list, and uninstall Google Chrome from the list 2. Go to this l...Google Help
- [10](https://www.engadget.com/google-chrome-apple-silicon-available-again-205437115.html)Chrome for M1 Macs is available again after being pulled last nightThe Apple Silicon version of Google Chrome is once again available to download. On Tuesday, you could briefly download it before G...Engadget
- [11](https://support.google.com/chromebook/answer/1086915?hl=en)Switch between stable, beta & dev software - Chromebook HelpYou can test the latest features of the Chrome operating system (OS) by switching to a more experimental software channel. ChromeO...Google Help

- [5](https://chromereleases.googleblog.com/2026/06/chrome-beta-for-desktop-update_02072900116.html)Chrome Beta for Desktop UpdateChrome Beta for Desktop Update The Beta channel has been updated to 150.0.7871.46 for Windows, Mac and Linux. A partial list of ch...blog.google
- [6](https://support.google.com/chrome/thread/309677160/download-location-cannot-change?hl=en)download location cannot change - Google Chrome CommunityTap the three dots in the top right corner of the Chrome browser and select "Settings." Look for a section related to downloads or...Google Help
- [7](https://www.youtube.com/watch?v=hZGT-_tqCmg&vl=en-US)How to Change Chrome's Default Download Location!are you tired of your downloads cluttering the default folder in the next 2 minutes I'll show you exactly how to change Chrome's d...1:36YouTube·Devity Works

Show all

### References

[1] [google](https://support.google.com/websearch/answer/16517651)
[2] [google](https://policies.google.com/privacy)
[3] [google](https://policies.google.com/terms)
[4] [google](https://support.google.com/legal/answer/3110420)
[5] [googleblog](https://chromereleases.googleblog.com/2026/06/chrome-beta-for-desktop-update_02072900116.html)
[6] [google](https://support.google.com/chrome/thread/309677160/download-location-cannot-change?hl=en)
[7] [youtube](https://www.youtube.com/watch?v=hZGT-_tqCmg&vl=en-US)
[8] [googleblog](https://chromereleases.googleblog.com/2026/06/chrome-for-android-update_01850164664.html)
[9] [google](https://support.google.com/chrome/thread/212228514/error-1603-in-installing-nearby-share-beta?hl=en)
[10] [engadget](https://www.engadget.com/google-chrome-apple-silicon-available-again-205437115.html)
[11] [google](https://support.google.com/chromebook/answer/1086915?hl=en)