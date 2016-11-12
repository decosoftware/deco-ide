//
//  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <XCTest/XCTestDefines.h>

NS_ASSUME_NONNULL_BEGIN

#if XCT_UI_TESTING_AVAILABLE

/*!
 * @enum XCUIRemoteButton
 *
 * A button on a physical remote control.
 */
typedef NS_ENUM(NSUInteger, XCUIRemoteButton) {
    XCUIRemoteButtonUp          = 0,
    XCUIRemoteButtonDown        = 1,
    XCUIRemoteButtonLeft        = 2,
    XCUIRemoteButtonRight       = 3,
    
    XCUIRemoteButtonSelect      = 4,
    XCUIRemoteButtonMenu        = 5,
    XCUIRemoteButtonPlayPause   = 6,
};

#if TARGET_OS_TV

/*!
 * @class XCUIRemote
 *
 * Simulates interaction with a physical remote control.
 */
NS_CLASS_AVAILABLE_IOS(9_0)
@interface XCUIRemote : NSObject

/*!
 * The simulated physical remote control.
 */
+ (instancetype)sharedRemote;

/*!
 * Sends a momentary press of a button on a physical remote control.
 *
 * @param remoteButton
 * The button on the physical remote control for which to synthesize a press.
 */
- (void)pressButton:(XCUIRemoteButton)remoteButton;

/*!
 * Sends a press and hold of a button on a physical remote control, holding for the specified duration.
 *
 * @param remoteButton
 * The button on the physical remote control for which to synthesize a press.
 *
 * @param duration
 * Duration in seconds.
 */
- (void)pressButton:(XCUIRemoteButton)remoteButton forDuration:(NSTimeInterval)duration;

@end

#endif

#endif

NS_ASSUME_NONNULL_END
