//
//  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>
#import <XCTest/XCUIElement.h>

NS_ASSUME_NONNULL_BEGIN

#if XCT_UI_TESTING_AVAILABLE

NS_CLASS_AVAILABLE(10_11, 9_0)

/*! Proxy for an application. The information identifying the application is specified in the Xcode target settings as the "Target Application". */
@interface XCUIApplication : XCUIElement

/*!
 * Launches the application. This call is synchronous and when it returns the application is launched
 * and ready to handle user events. Any failure in the launch sequence is reported as a test failure
 * and halts the test at this point. If the application is already running, this call will first
 * terminate the existing instance to ensure clean state of the launched instance.
 */
- (void)launch;

/*!
 * Terminates any running instance of the application. If the application has an existing debug session
 * via Xcode, the termination is implemented as a halt via that debug connection. Otherwise, a SIGKILL
 * is sent to the process.
 */
- (void)terminate;

/*!
 * The arguments that will be passed to the application on launch. If not modified, these are the
 * arguments that Xcode will pass on launch. Those arguments can be changed, added to, or removed.
 * Unlike NSTask, it is legal to modify these arguments after the application has been launched. These
 * changes will not affect the current launch session, but will take effect the next time the application
 * is launched.
 */
@property (nonatomic, copy) NSArray <NSString *> *launchArguments;

/*!
 * The environment that will be passed to the application on launch. If not modified, this is the
 * environment that Xcode will pass on launch. Those variables can be changed, added to, or removed.
 * Unlike NSTask, it is legal to modify the environment after the application has been launched. These
 * changes will not affect the current launch session, but will take effect the next time the application
 * is launched.
 */
@property (nonatomic, copy) NSDictionary <NSString *, NSString *> *launchEnvironment;

@end

#endif

NS_ASSUME_NONNULL_END
