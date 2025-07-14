## Plan

1. Add a toggle button to enable or disable the coin rim for both uploaded images and templates. When disabled, the rim should not be rendered at all.
2. Investigate and fix why the rim controls do not affect the image after uploading. Ensure the rim can be enabled/disabled and its properties adjusted after an image is uploaded.
3. Investigate and fix the cause of the image blinking (flickering/re-rendering) when editing, adding text, or changing rim settings. Optimize rendering so only necessary parts update, preventing full image reloads.
4. Test with uploaded images and templates. Confirm rim toggle works, rim settings apply correctly, and no blinking occurs during edits.

---

State.Status = NEEDS_PLAN_APPROVAL 