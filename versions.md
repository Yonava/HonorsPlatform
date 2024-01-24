# Current Version: prerelease 0.92

### prerelease 0.92 (Jan. 24)
- Feature / Mailing Lists: Build and store custom mailing lists with emails of students or grads
- Improvement / Moved Build Registrar List to popover button on BottomLeftActions
- Compose Mass Email and Build Registrar List routes removed
- Created dirs for composables + utils, and added route aliases for import statements
- Added tooltips to all BottomLeftActions
- Changed the style of the item number display in PanelTitle
- Renamed useAuth APIs "authorize" -> "authorizeBeforeContinuing", "forceAuthorize" -> "endSessionAndPromptOAuth", "getURL" -> "getGoogleOAuthURL" + more
- New ServerError "END_SESSION_FALLBACK" if endSessionAndPromptOAuth, formerly forceAuthorize, fails
- Revamped useDialog to be promise based and rewrote warn dialog utility 
- Added InfoBtn component for inline tooltips
- Added icons and tooltips to additional tools
- Broke up AppBar into several smaller components, placing them in new Panel/AppBar dir

### prerelease 0.91 (Aug. 27)
- Feature / Better Updates: Updates now go through the useUpdateManager pinia store instead of TrackItemForUpdate. New batch update endpoints mean previous full row mapping methodology has been replaced with precise cell updates for better audit trails on Google Sheets
- Feature / Snackbars: Snackbars have been added to useDialog for extra information when an item is deleted, another user acts in a manner that interferes with the flow of your editing process (aka deletes an item or changes embedded item studentSysId) and other relevant scenarios
- Feature / Duplicate Sys Id Remediation: Data Mappers now detect if there are duplicate sysIds and will alert the user if there are including giving the user the ability to overview what is causing the problem and preform a special row delete action to precisely resolve conflicts
- Improvement: List Item components have been completely revamped and modularized, text on list items truncates with ellipsis as opposed to new-lining
- Improvement: Logging into the platform with View/Comment perms on Google Sheets will automatically switch your session to read-only
- Added the "p" shortcut to completely collapse the panel list
- Student athletics changes from v-autocomplete to v-select on touch devices
- Added "Current Time" button to Graduate Engagement Detail

### prerelease 0.90 (Aug. 21)
- Feature / Read-Only Mode: Users are now able to place themselves in and be placed in read-only mode through the additional tools menu. Read-only mode toggles off the ability to make any changes to data on the platform including the ability to make announcements. In addition, access to features such as "Create Registrar List" as well as "Generate Mass Email" are disabled
- Feature / Custom Fields: Custom fields can now be added to every panel with first class support for sockets, read-only mode, and embedded panel views.
- Improvement: Previously cramped input fields (especially at smaller device sizes and on side by side editing) have been modified to take up more space and scale to adjust automatically as width changes using the new InputCoupler API
- Graduate panel and Student panel ID inputs have been merged and improved with the new IDInput API
- New Pinia store "useSocket" added to accommodate a more robust socket architecture and add an additional layer for separation of concerns
- Added timestamps to posted announcements

### prerelease 0.89 (Aug. 13)
- Feature / Profile Menu: Profile menu added to BottomLeftActions on panel displaying time of last login and ability to logout + more
- Improvement: Announcements now can be posted by any honors staff through their profile menu. Announcements display more information including profile information of poster, and post date
- Huge preformance improvements introduced using virtualScrollList on PanelList with the tradeoffs of TransitionList animations
- Socket userAction "announce" added for live announcement posting
- Improved delete suggestions that have migrated to the StudentSysId and StudentMatcher APIs
- New ServerErrors introduced and parsed on AuthPage to provide more transparency into server errors for end users
- If a DocuSign date is unable to be parsed on ModuleListItem, a new "Invalid Date" state is shown to users
- Various bug fixes to improve system stability and reliability

### prerelease 0.88 (Aug. 2)
- Feature / Live Collaboration: The Honors Program platform is live. Edits are broadcasted between clients for a truely collaborative experience
- Feature / Google Profiles: Added Google Profile Info API to always see which account you are editing on
- Feature / Drag to Move: Item can now be dragged to trigger moving it to a different panel
- Improvement: The ability to logout has been added so users with mutliple accounts can switch which account they are using
- Refresh Data has been removed and added to Additional Tools
- Moved Selected Item navigation drawer for SM devices to ItemDetailSM.vue and fixed jittery behavior
- useDocumentCache code refactor for clarity, cleanliness, and consistency
- Changed focusedItem to focusedItemSysId
- Fixed bug causing application after google auth to unintentionally close if spawned from a third party link
- Sync state now only indicated on the item that is focused
- Enhanced type safety and code quality on TrackItemForUpdate
- Removed all clearable attributes on vuetify input elements as they are not compatible with Vue deep watchers
- Improvement: Added tooltips to all sort options
- Removed phone number sort option on Graduates panel because who sorts by phone number 😂
- Added Locals file for standardizing localStorage namespaces
- Added useMoveItem composable for standardizing and streamlining the process of moving any item to any other compatible panel
- Expanded warn API to add "persistent" option

### prerelease 0.87 (Jul. 19)
- Feature / Pinned Items: Pinned items allow users to pin items in the sidebar list which persist between sessions
- Feature / Quick Actions: List Item Actions/Quick Actions let users access frequently used actions just one click away
- Improvement: Completed Modules can now be moved back to the Modules panel
- Sidebar list now animates when user pins items or an item is added to the list
- Expanded the useDialog API to include options for props and persistence
- Tweaked the UI and calendar icons for the Sort Panel
- Replaced "Points" with "Class Year" on student list item, and changed the Class Year icon to "mdi-briefcase"
- Added custom tooltips for each student "Status"
- Added the "properties" object to each panel to standardize the utilities of variously named properties within each panels unique SheetItem
- Added easter egg icons 🦄

### prerelease 0.86.2 (Jul. 16)
- Improvement: Registrar list builder will now try to find graduate match for module if student is not found
- Efficiency improvement on mass delete. Replaces range as opposed to deleting one-by-one
- Fixed tooltip message for useStudentInfo
- Fixed bug that caused selected panels to not propagate updates properly

### prerelease 0.86 (Jul. 15)
- Feature / Multi-Profile Editing: Drag & drop items from the item list to create a custom side-by-side workspace
- Improvement: added search to student and graduate link dialogs
- Minor UI improvements to AuthPage
- Added "getItemByKeyValue" method to useDocumentCache

### prerelease 0.85 (Jul. 9)
- Improved Data Modeling: Added Student Sys ID to data layer across all panels dependent on students or graduates.
- Fixed bug that caused items to duplicate when moved between ranges without document refresh
- StudentMatch API drastically improved and moved into its own composable
- StudentLink and StudentLinkButton added to all panels dependent on students or graduates to relink on the fly
- Student IDs can now finally be edited!
- Students and Graduates can now hold modules and engagements without the need for an ID
- Removed LockArea on EmbeddedDetail
- Various other minor stability improvements

### prerelease 0.84.3 (Jul. 8)
- Overhauled "increment student year" to add the ability to include or exclude students
- Major simplifications and efficiency improvements to suggested delete panel
- Transitioned InstructorAutoComplete from legacy instructor caching system to new useDocumentCache api and enhanced the logic to re-assess available instructors efficiently on the fly
- Fixed major bug with postInRange causing data to be misaligned when posting batch data

### prerelease 0.84 (Jul. 4)
- Improved loading times across every panel
- Changed model for loading data by adding the "Dependencies" property to each panel
- Wrote batchGet API integrations to fetch data much faster and much more efficiently
- Removed "fetchItems" API in favor of getAllDocuments for managing batchGet endpoint and cache refresh API
- Fixed bug causing announcements to refetch and read state to be wiped after closing PanelCoverAppBar

### prerelease 0.83 (Jul. 2)
- Feature: Live updating smart suggestions to quickly flag and delete any unwanted entities in the system. Tests against dozens of criteria and forms a "rationale" paragraph along with two levels of recommendation ("warn" for consider, and "danger" for strongly recommended) based on how urgent the problem being flagged is deemed
- Removed “Missing Start Date” DocuSign Status on module list item in favor of displaying “DocuSign Completed” no matter if there is a start date or not
- Brand new useStudentMatch composable added to link together any component with a studentId to a student (with graduate fallback). Displays human readable errors when student is found but in graduates, if student is not found in either students or graduates, or when a studentId is missing from the entity
- Thesis "view ..." (jump to) button can now if it can jump to a student, or if the destination for the jump is a graduate. Has 4 different states for users: No student linked (no id), no student found (no grad or student matching id), "View Student" when student exists, and "View Graduate" if the ID links to a grad
- Student panel icon switched from mdi-account-group to mdi-account
- Added new sort option to Grad Engagements: “Event”

### prerelease 0.82 (Jun. 24)
- Graduate engagements added as a full service panel with list item and detail
- Fixed sort panel not updating sort options on panel switch
- Reordered panels and refactored panel key bindings to dynamically rebind when panels re-order
- useUpdateItem now terminates impending update request when user reverts item back to former state
- Bug fixes on useDocumentCache updateItem
- Improved setSelectedItemByKeyValue API on useDocumentCache
- Fixed bug that duplicated module when selecting to move it to completed before it saved the original module to sheet

### prerelease 0.81 (Jun. 22)
- Fixed student year increment cache duplication bugs
- Fixed completed module term display red text bug
- Removed Finish Module system and replaced it with a cleaner system that integrates with new Pinia APIs
- Integrated the embedded module detail system with useDocumentCache
- Removed mass add and remove from cache endpoints on useDocumentCache. On mass updates, refreshCache preferred
- Improved the useDocument addItemToCache API and renamed it to addItem for consistency
- Added concurrency controls to deleteItem in useDocumentCache
- Student year now defaults to "Senior" when moved from graduates back to students
- Tons of other smaller bug fixes and improvements

### prerelease 0.8 (Jun. 19)
- Entire application much more efficient with REST requests
- Massive architectural overhaul: added useDocumentCache store to create comprehensive document caching system with auto detection of stale data
- Cleaned up and standardized dialog messages and color schemes
- Standardized panel embeddings new pinia store APIs
- Recursive embeddings refreshCache written to do a full cache refresh when user hits "Refresh Data" button on AppBar
- Various smaller code quality improvements

### prerelease 0.78 (Jun. 14)
- Feature: Better dialogs on mobile. ModalContent now handles xs device modals using navigation-drawer for a non-abrasive user experience
- Improvement: Improvements to the "Add Student Note" feature. Added date to each new note, added autofocusing inputs, and added new keyboard shortcuts.
- Tweak: Added version exporting from Panel
- Bug Fix: Fixed bug where some browsers blocked the auth pop-ups by adding a button after 1 second to the authorization information modal.
- Tweak: Dialogbody made optional in typescript definition (useDialog)

### prerelease 0.77 (Jun. 9)
- Feature: Authorization state moved to Pinia for seriously improved auth flow. Increased efficiency, auth in fewer clicks, and open a new tab to authenticate while preserving each request in a queue so no data is lost due to reload.
- UI tweaks on AddBar.vue for mobile nav drawers
- Bug Fix: 3 second buffer added to thesis unlock to allow freshly inserted StudentId time to propagate

### prerelease 0.76 (Jun. 7)
- Feature: Add API for friction-free experience adding an item, including self removing empty items and add button UI feedback

### prerelease 0.75 (Jun. 6)
- Feature: new "Create Temporary Sheet" tool on every panel allows users to create a temporary speadsheet with a subset of the columns/properties available on each panel configurable through a new dialog.
- Cleanup: Removed deprecated "Add" from panel components
- Bug Fix: Fixed bug that prevented registrar list and mass email from utilizing the modules and completed modules panel
