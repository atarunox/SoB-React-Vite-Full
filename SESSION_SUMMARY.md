# Session Summary - Custom Dialog UI for All Prompts

## Date
December 5, 2025

## Branch
`claude/finish-general-store-events-01TucXwmmrRsGyH7BTdFJ5XW`

## Overview
Implemented complete Defense and Armor resolution system for Indian Trading Post Event #2 (Spirits Running Amok), with improved prompts and user experience across all combat resolution in the game. Extended custom dialog UI to replace ALL native browser prompts throughout the TownTab.

---

## Changes Made

### 1. **Indian Trading Post Event #2 - Full Combat Resolution**
**Commit:** `d3f48be`

- Auto-rolls 2D6 for incoming Hits (each hero gets different roll)
- Integrated `resolveDefensePerHitThenArmorPerWound` utility for proper damage flow
- Defense Roll Prompt: Player can manually enter results or auto-roll
- Armor Roll Prompt: After Defense, player can manually enter Armor results or auto-roll
- Applies final wounds to Health after both defense layers
- Changed action type from `TAKE_HITS` to `TAKE_WOUNDS` for accurate tracking

**Files Modified:**
- `src/utils/locationHandlers/indianTradingPostHandler.js`

---

### 2. **Improved Defense/Armor Prompt Messages**
**Commit:** `fe65536`

- Changed from "How many FAILED?" to "How many PASSED?" for better clarity
- Replaced separate yes/no prompt with single input: enter `-1` to auto-roll
- Default value is `-1` for quick auto-roll gameplay
- Applied same improvements to Willpower and Spirit Armor for consistency
- Clearer toast messages showing results

**Files Modified:**
- `src/utils/combatResolution.js`

---

### 3. **Simplified Roll Prompt - No Extra Prompts**
**Commit:** `39c3fe9`

- Removed complex prompt asking for individual dice values
- When auto-roll is selected (-1), dice roll immediately
- Eliminates confusing second prompt step
- Makes Defense/Armor roll flow much smoother

**Files Modified:**
- `src/components/TownTab/index.jsx`

---

### 4. **Clarified Roll Prompts with Better Formatting**
**Commit:** `cf13f86`

**Defense Prompt Now Shows:**
```
DEFENSE ROLL

6 Hits incoming!
Hero has Defense 3+

Roll 6d6 for Defense.
How many dice showed 3+ (PASSED)?

[Enter -1 to auto-roll]
```

**Armor Prompt Now Shows:**
```
ARMOR ROLL

4 Wounds incoming!
Hero has Armor 5+

Roll 4d6 for Armor.
How many dice showed 5+ (PASSED)?

[Enter -1 to auto-roll]
```

- Added clear headers (DEFENSE ROLL, ARMOR ROLL, etc.)
- Shows what's at stake (X Hits/Wounds incoming!)
- Shows the hero's stat value
- Explicitly states what to roll
- Applied to Willpower and Spirit Armor as well

**Files Modified:**
- `src/utils/combatResolution.js`

---

### 5. **Fixed promptNumber to Display Full Message**
**Commit:** `5ab9c1b`

- `promptNumber` now displays the complete message with all details
- Shows hits/wounds incoming, hero's stat value, and instructions
- Default value of `-1` pre-filled for quick auto-roll (just press OK)
- Fixed the issue where only the title was showing

**Files Modified:**
- `src/components/TownTab/index.jsx`

---

## Impact

These changes affect:
- ✅ **Indian Trading Post Event #2** - Full damage resolution with Defense and Armor
- ✅ **All combat in the game** - Improved prompts for Defense, Armor, Willpower, and Spirit Armor rolls
- ✅ **User Experience** - Clearer messaging, faster gameplay with smart defaults

## Testing Notes

Test cases to verify:
1. Indian Trading Post Event #2 triggers and rolls 2D6 damage per hero
2. Defense prompt shows with clear formatting and stat values
3. Armor prompt appears after Defense with remaining wounds
4. Entering `-1` or pressing OK immediately auto-rolls
5. Manual entry of success count works correctly
6. Final wounds are applied to Health stat

---

### 6. **Add Auto-Roll Button to Defense/Armor Prompts**
**Commit:** `decff3f`

- Replaced "-1 to auto-roll" instruction with actual Auto-Roll button
- Created CustomPromptDialog component with dark-themed UI
- Number mode: Text input with Auto-Roll/Cancel/OK buttons
- Auto-Roll button is prominent and easy to use
- Applied to all Defense, Armor, Willpower, and Spirit Armor prompts

**Files Created:**
- `src/components/CustomPromptDialog.jsx`

**Files Modified:**
- `src/components/TownTab/index.jsx`

---

### 7. **Apply Custom Dialog to All Dice Rolls**
**Commit:** `f9f0a94`

- Added 'test' mode to CustomPromptDialog for stat tests
- Test mode shows Pass/Fail/Auto-Roll/Cancel buttons
- Green Pass button, Red Fail button, Blue Auto-Roll button
- Updated test function in TownTab to use custom dialog
- All Agility, Cunning, Lore, etc. tests now use custom UI

**Files Modified:**
- `src/components/CustomPromptDialog.jsx`
- `src/components/TownTab/index.jsx`

---

### 8. **Replace Native Prompts in Location Events**
**Commit:** (multiple commits)

- Updated LocationEventModal to use CustomPromptDialog
- Updated TownEventCard to use custom dialog for "Set roll..."
- Event roll setting now uses custom number input with Auto-Roll button

**Files Modified:**
- `src/components/Town/LocationEventModel.jsx`
- `src/components/TownTab/TownEventCard.jsx`

---

### 9. **Add Choice Mode for Multiple Choice Prompts**
**Commit:** `d03c087`

- Added 'choice' mode to CustomPromptDialog
- Displays large, clickable buttons for each option
- Numbers each choice (1, 2, 3, etc.)
- Updated promptChoice in TownTab to use custom dialog
- All event choices (e.g., "Possessed Shaman") now use custom UI

**Files Modified:**
- `src/components/CustomPromptDialog.jsx`
- `src/components/TownTab/index.jsx`

---

### 10. **Add Yes/No and Text Modes; Replace ALL Native Prompts in TownTab**
**Commit:** `879cb2f`

- Added 'yesno' mode with Yes/No buttons (green/red)
- Added 'text' mode with text input and OK/Cancel buttons
- Updated CustomPromptDialog handleSubmit to support text mode
- Replaced ALL window.confirm and window.prompt calls in TownTab/index.jsx:
  - `promptYesNo` → custom yesno mode
  - `promptText` → custom text mode
  - `chooseRerollFlex` → custom choice mode
  - `promptPay` → custom yesno mode
  - Gambling Hall prompts → custom dialogs
  - MQ Surgeon condition selection → custom choice mode
  - Treat Corruption → custom number mode
  - Black Market price die → custom number mode
- All prompts in TownTab now use consistent custom UI
- No more native browser prompts in main game flow

**Files Modified:**
- `src/components/CustomPromptDialog.jsx`
- `src/components/TownTab/index.jsx`

---

## Impact

These changes affect:
- ✅ **Indian Trading Post Event #2** - Full damage resolution with Defense and Armor
- ✅ **All combat in the game** - Improved prompts for Defense, Armor, Willpower, and Spirit Armor rolls
- ✅ **All stat tests** - Pass/Fail/Auto-Roll buttons for Agility, Cunning, Lore, etc.
- ✅ **All event choices** - Button-based selection for event options
- ✅ **All number inputs** - Consistent UI with Auto-Roll option
- ✅ **All yes/no confirmations** - Green Yes / Red No buttons
- ✅ **All text inputs** - Dark-themed text input with OK/Cancel
- ✅ **User Experience** - Unified, professional UI; no more native browser prompts

## Testing Notes

Test cases to verify:
1. Indian Trading Post Event #2 triggers and rolls 2D6 damage per hero
2. Defense prompt shows with clear formatting and stat values
3. Armor prompt appears after Defense with remaining wounds
4. Auto-Roll button immediately auto-rolls
5. Manual entry of success count works correctly
6. Final wounds are applied to Health stat
7. Stat tests show Pass/Fail/Auto-Roll buttons
8. Event choices show as large clickable buttons
9. Yes/No confirmations show green/red buttons
10. Text inputs use dark-themed custom dialog
11. All prompts throughout TownTab use custom UI

---

## Future Work

Potential improvements:
- Update remaining utility files to use custom dialogs when called from React components
- Add keyboard shortcuts (Enter for OK, Escape for Cancel, etc.)
- Consider adding visual indicators or animations for auto-roll results
- Add option to remember player's preference (auto-roll vs manual)
