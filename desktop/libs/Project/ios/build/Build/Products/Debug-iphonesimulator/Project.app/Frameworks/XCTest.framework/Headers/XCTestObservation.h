//
//  Copyright (c) 2014-2015 Apple Inc. All rights reserved.
//

#import <XCTest/XCTestDefines.h>

NS_ASSUME_NONNULL_BEGIN

@class XCTestSuite, XCTestCase;

/*!
 * @protocol XCTestObservation
 *
 * Objects conforming to XCTestObservation can register to be notified of the progress of test runs. See XCTestObservationCenter
 * for details on registration.
 *
 * Progress events are delivered in the following sequence:
 *
 * -testBundleWillStart:                            // exactly once per test bundle
 *      -testSuiteWillStart:                        // exactly once per test suite
 *          -testCaseWillStart:                     // exactly once per test case
 *          -testCase:didFailWithDescription:...    // zero or more times per test case, any time between test case start and finish
 *          -testCaseDidFinish:                     // exactly once per test case
 *      -testSuite:didFailWithDescription:...       // zero or more times per test suite, any time between test suite start and finish
 *      -testSuiteDidFinish:                        // exactly once per test suite
 * -testBundleDidFinish:                            // exactly once per test bundle
 */
@protocol XCTestObservation <NSObject>
@optional

/*!
 * @method -testBundleWillStart:
 *
 * Sent immediately before tests begin as a hook for any pre-testing setup.
 *
 * @param testBundle The bundle containing the tests that were executed.
 */
- (void)testBundleWillStart:(NSBundle *)testBundle;

/*!
 * @method -testBundleDidFinish:
 *
 * Sent immediately after all tests have finished as a hook for any post-testing activity. The test process will generally
 * exit after this method returns, so if there is long running and/or asynchronous work to be done after testing, be sure
 * to implement this method in a way that it blocks until all such activity is complete.
 *
 * @param testBundle The bundle containing the tests that were executed.
 */
- (void)testBundleDidFinish:(NSBundle *)testBundle;

/*!
 * @method -testSuiteWillStart:
 *
 * Sent when a test suite starts executing.
 *
 * @param testSuite The test suite that started. Additional information can be retrieved from the associated XCTestRun.
 */
- (void)testSuiteWillStart:(XCTestSuite *)testSuite;

/*!
 * @method -testSuiteDidFail:withDescription:inFile:atLine:
 *
 * Sent when a test suite reports a failure. Suite failures are most commonly reported during suite-level setup and teardown
 * whereas failures during tests are reported for the test case alone and are not reported as suite failures.
 *
 * @param testSuite The test suite that failed. Additional information can be retrieved from the associated XCTestRun.
 * @param description A textual description of the failure.
 * @param filePath The path of file where the failure occurred, nil if unknown.
 * @param lineNumber The line where the failure was reported.
 */
- (void)testSuite:(XCTestSuite *)testSuite didFailWithDescription:(NSString *)description inFile:(nullable NSString *)filePath atLine:(NSUInteger)lineNumber;

/*!
 * @method -testSuiteDidFinish:
 *
 * Sent when a test suite finishes executing.
 *
 * @param testSuite The test suite that finished. Additional information can be retrieved from the associated XCTestRun.
 */
- (void)testSuiteDidFinish:(XCTestSuite *)testSuite;

/*!
 * @method -testCaseWillStart:
 *
 * Sent when a test case starts executing.
 *
 * @param testCase The test case that started. Additional information can be retrieved from the associated XCTestRun.
 */
- (void)testCaseWillStart:(XCTestCase *)testCase;

/*!
 * @method -testCaseDidFail:withDescription:inFile:atLine:
 *
 * Sent when a test case reports a failure.
 *
 * @param testCase The test case that failed. Additional information can be retrieved from the associated XCTestRun.
 * @param description A textual description of the failure.
 * @param filePath The path of file where the failure occurred, nil if unknown.
 * @param lineNumber The line where the failure was reported.
 */
- (void)testCase:(XCTestCase *)testCase didFailWithDescription:(NSString *)description inFile:(nullable NSString *)filePath atLine:(NSUInteger)lineNumber;

/*!
 * @method -testCaseDidFinish:
 *
 * Sent when a test case finishes executing.
 *
 * @param testCase The test case that finished. Additional information can be retrieved from the associated XCTestRun.
 */
- (void)testCaseDidFinish:(XCTestCase *)testCase;

@end

NS_ASSUME_NONNULL_END
