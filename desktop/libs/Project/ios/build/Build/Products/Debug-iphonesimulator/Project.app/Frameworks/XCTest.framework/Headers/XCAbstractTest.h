//
// Copyright (c) 2013-2015 Apple Inc. All rights reserved.
//
// Copyright (c) 1997-2005, Sen:te (Sente SA).  All rights reserved.
//
// Use of this source code is governed by the following license:
// 
// Redistribution and use in source and binary forms, with or without modification, 
// are permitted provided that the following conditions are met:
// 
// (1) Redistributions of source code must retain the above copyright notice, 
// this list of conditions and the following disclaimer.
// 
// (2) Redistributions in binary form must reproduce the above copyright notice, 
// this list of conditions and the following disclaimer in the documentation 
// and/or other materials provided with the distribution.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS ``AS IS'' 
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED 
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. 
// IN NO EVENT SHALL Sente SA OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
// OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
// HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, 
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 
// Note: this license is equivalent to the FreeBSD license.
// 
// This notice may not be removed from this file.

#import <XCTest/XCTestDefines.h>

NS_ASSUME_NONNULL_BEGIN

@class XCTestRun;

/*!
 * @class XCTest
 *
 * An abstract base class for testing. XCTestCase and XCTestSuite extend XCTest to provide
 * for creating, managing, and executing tests. Most developers will not need to subclass
 * XCTest directly.
 */
@interface XCTest : NSObject {
#ifndef __OBJC2__
@private
    id _internal;
#endif
}

/*!
 * @property testCaseCount
 * Number of test cases. Must be overridden by subclasses.
 */
@property (readonly) NSUInteger testCaseCount;

/*!
 * @property name
 * Test's name. Must be overridden by subclasses.
 */
@property (readonly, copy, nullable) NSString *name;

/*!
 * @property testRunClass
 * The XCTestRun subclass that will be instantiated when the test is run to hold
 * the test's results. Must be overridden by subclasses.
 */
@property (readonly, nullable) Class testRunClass;

/*!
 * @property testRun
 * The test run object that executed the test, an instance of testRunClass. If the test has not yet been run, this will be nil.
 */
@property (readonly, nullable) XCTestRun *testRun;

/*!
 * @method -performTest:
 * The method through which tests are executed. Must be overridden by subclasses.
 */
- (void)performTest:(XCTestRun *)run;

/*!
 * @method -runTest
 * Creates an instance of the testRunClass and passes it as a parameter to -performTest:.
 */
- (void)runTest;

/*!
 * @method -setUp
 * Setup method called before the invocation of each test method in the class.
 */
- (void)setUp;

/*!
 * @method -tearDown
 * Teardown method called after the invocation of each test method in the class.
 */
- (void)tearDown;

@end

NS_ASSUME_NONNULL_END
