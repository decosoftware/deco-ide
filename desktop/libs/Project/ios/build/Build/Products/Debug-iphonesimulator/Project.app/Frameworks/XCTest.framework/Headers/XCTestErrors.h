//
//  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>

/*!
 * @const XCTestErrorDomain
 * Domain for errors provided by the XCTest framework.
 */
XCT_EXPORT NSString *const XCTestErrorDomain;

/*!
 * @typedef XCTestErrorCode
 * Error codes used with errors in the XCTestErrorDomain.
 *
 * @constant XCTestErrorCodeTimeoutWhileWaiting Indicates that a call to -waitForExpectationsWithTimeout:handler: timed out.
 * @constant XCTestErrorCodeFailureWhileWaiting Indicates that a failure assertion was raised while waiting in -waitForExpectationsWithTimeout:handler:.
 */
typedef NS_ENUM(NSInteger, XCTestErrorCode) {
    XCTestErrorCodeTimeoutWhileWaiting,
    XCTestErrorCodeFailureWhileWaiting,
};

