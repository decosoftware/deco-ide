//
//  Copyright (c) 2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>

#if XCT_UI_TESTING_AVAILABLE

NS_ASSUME_NONNULL_BEGIN

@class XCUIElementQuery;

@protocol XCUIElementTypeQueryProvider

@property (readonly, copy) XCUIElementQuery *groups;
@property (readonly, copy) XCUIElementQuery *windows;
@property (readonly, copy) XCUIElementQuery *sheets;
@property (readonly, copy) XCUIElementQuery *drawers;
@property (readonly, copy) XCUIElementQuery *alerts;
@property (readonly, copy) XCUIElementQuery *dialogs;
@property (readonly, copy) XCUIElementQuery *buttons;
@property (readonly, copy) XCUIElementQuery *radioButtons;
@property (readonly, copy) XCUIElementQuery *radioGroups;
@property (readonly, copy) XCUIElementQuery *checkBoxes;
@property (readonly, copy) XCUIElementQuery *disclosureTriangles;
@property (readonly, copy) XCUIElementQuery *popUpButtons;
@property (readonly, copy) XCUIElementQuery *comboBoxes;
@property (readonly, copy) XCUIElementQuery *menuButtons;
@property (readonly, copy) XCUIElementQuery *toolbarButtons;
@property (readonly, copy) XCUIElementQuery *popovers;
@property (readonly, copy) XCUIElementQuery *keyboards;
@property (readonly, copy) XCUIElementQuery *keys;
@property (readonly, copy) XCUIElementQuery *navigationBars;
@property (readonly, copy) XCUIElementQuery *tabBars;
@property (readonly, copy) XCUIElementQuery *tabGroups;
@property (readonly, copy) XCUIElementQuery *toolbars;
@property (readonly, copy) XCUIElementQuery *statusBars;
@property (readonly, copy) XCUIElementQuery *tables;
@property (readonly, copy) XCUIElementQuery *tableRows;
@property (readonly, copy) XCUIElementQuery *tableColumns;
@property (readonly, copy) XCUIElementQuery *outlines;
@property (readonly, copy) XCUIElementQuery *outlineRows;
@property (readonly, copy) XCUIElementQuery *browsers;
@property (readonly, copy) XCUIElementQuery *collectionViews;
@property (readonly, copy) XCUIElementQuery *sliders;
@property (readonly, copy) XCUIElementQuery *pageIndicators;
@property (readonly, copy) XCUIElementQuery *progressIndicators;
@property (readonly, copy) XCUIElementQuery *activityIndicators;
@property (readonly, copy) XCUIElementQuery *segmentedControls;
@property (readonly, copy) XCUIElementQuery *pickers;
@property (readonly, copy) XCUIElementQuery *pickerWheels;
@property (readonly, copy) XCUIElementQuery *switches;
@property (readonly, copy) XCUIElementQuery *toggles;
@property (readonly, copy) XCUIElementQuery *links;
@property (readonly, copy) XCUIElementQuery *images;
@property (readonly, copy) XCUIElementQuery *icons;
@property (readonly, copy) XCUIElementQuery *searchFields;
@property (readonly, copy) XCUIElementQuery *scrollViews;
@property (readonly, copy) XCUIElementQuery *scrollBars;
@property (readonly, copy) XCUIElementQuery *staticTexts;
@property (readonly, copy) XCUIElementQuery *textFields;
@property (readonly, copy) XCUIElementQuery *secureTextFields;
@property (readonly, copy) XCUIElementQuery *datePickers;
@property (readonly, copy) XCUIElementQuery *textViews;
@property (readonly, copy) XCUIElementQuery *menus;
@property (readonly, copy) XCUIElementQuery *menuItems;
@property (readonly, copy) XCUIElementQuery *menuBars;
@property (readonly, copy) XCUIElementQuery *menuBarItems;
@property (readonly, copy) XCUIElementQuery *maps;
@property (readonly, copy) XCUIElementQuery *webViews;
@property (readonly, copy) XCUIElementQuery *steppers;
@property (readonly, copy) XCUIElementQuery *incrementArrows;
@property (readonly, copy) XCUIElementQuery *decrementArrows;
@property (readonly, copy) XCUIElementQuery *tabs;
@property (readonly, copy) XCUIElementQuery *timelines;
@property (readonly, copy) XCUIElementQuery *ratingIndicators;
@property (readonly, copy) XCUIElementQuery *valueIndicators;
@property (readonly, copy) XCUIElementQuery *splitGroups;
@property (readonly, copy) XCUIElementQuery *splitters;
@property (readonly, copy) XCUIElementQuery *relevanceIndicators;
@property (readonly, copy) XCUIElementQuery *colorWells;
@property (readonly, copy) XCUIElementQuery *helpTags;
@property (readonly, copy) XCUIElementQuery *mattes;
@property (readonly, copy) XCUIElementQuery *dockItems;
@property (readonly, copy) XCUIElementQuery *rulers;
@property (readonly, copy) XCUIElementQuery *rulerMarkers;
@property (readonly, copy) XCUIElementQuery *grids;
@property (readonly, copy) XCUIElementQuery *levelIndicators;
@property (readonly, copy) XCUIElementQuery *cells;
@property (readonly, copy) XCUIElementQuery *layoutAreas;
@property (readonly, copy) XCUIElementQuery *layoutItems;
@property (readonly, copy) XCUIElementQuery *handles;
@property (readonly, copy) XCUIElementQuery *otherElements;

@end

NS_ASSUME_NONNULL_END

#endif
