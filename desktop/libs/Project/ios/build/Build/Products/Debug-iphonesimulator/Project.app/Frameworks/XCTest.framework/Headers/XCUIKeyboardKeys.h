//
//  Copyright (c) 2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>
#import <Foundation/Foundation.h>

#if XCT_UI_TESTING_AVAILABLE

/*!
    Constants for use with -[XCUIElement typeKey:modifierFlags:],
    representing keys that have no textual representation. These comprise
    the set of control, function, and modifier keys found on most keyboards.
*/

extern NSString *const XCUIKeyboardKeyDelete;
extern NSString *const XCUIKeyboardKeyReturn;
extern NSString *const XCUIKeyboardKeyEnter;
extern NSString *const XCUIKeyboardKeyTab;
extern NSString *const XCUIKeyboardKeySpace;
extern NSString *const XCUIKeyboardKeyEscape;

extern NSString *const XCUIKeyboardKeyUpArrow;
extern NSString *const XCUIKeyboardKeyDownArrow;
extern NSString *const XCUIKeyboardKeyLeftArrow;
extern NSString *const XCUIKeyboardKeyRightArrow;

extern NSString *const XCUIKeyboardKeyF1;
extern NSString *const XCUIKeyboardKeyF2;
extern NSString *const XCUIKeyboardKeyF3;
extern NSString *const XCUIKeyboardKeyF4;
extern NSString *const XCUIKeyboardKeyF5;
extern NSString *const XCUIKeyboardKeyF6;
extern NSString *const XCUIKeyboardKeyF7;
extern NSString *const XCUIKeyboardKeyF8;
extern NSString *const XCUIKeyboardKeyF9;
extern NSString *const XCUIKeyboardKeyF10;
extern NSString *const XCUIKeyboardKeyF11;
extern NSString *const XCUIKeyboardKeyF12;
extern NSString *const XCUIKeyboardKeyF13;
extern NSString *const XCUIKeyboardKeyF14;
extern NSString *const XCUIKeyboardKeyF15;
extern NSString *const XCUIKeyboardKeyF16;
extern NSString *const XCUIKeyboardKeyF17;
extern NSString *const XCUIKeyboardKeyF18;
extern NSString *const XCUIKeyboardKeyF19;

extern NSString *const XCUIKeyboardKeyForwardDelete;
extern NSString *const XCUIKeyboardKeyHome;
extern NSString *const XCUIKeyboardKeyEnd;
extern NSString *const XCUIKeyboardKeyPageUp;
extern NSString *const XCUIKeyboardKeyPageDown;
extern NSString *const XCUIKeyboardKeyClear;
extern NSString *const XCUIKeyboardKeyHelp;

extern NSString *const XCUIKeyboardKeyCapsLock;
extern NSString *const XCUIKeyboardKeyShift;
extern NSString *const XCUIKeyboardKeyControl;
extern NSString *const XCUIKeyboardKeyOption;
extern NSString *const XCUIKeyboardKeyCommand;
extern NSString *const XCUIKeyboardKeyRightShift;
extern NSString *const XCUIKeyboardKeyRightControl;
extern NSString *const XCUIKeyboardKeyRightOption;
extern NSString *const XCUIKeyboardKeyRightCommand;
extern NSString *const XCUIKeyboardKeySecondaryFn;

#endif
