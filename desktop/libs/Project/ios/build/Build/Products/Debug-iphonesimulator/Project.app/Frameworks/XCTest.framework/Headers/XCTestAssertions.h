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

#import <XCTest/XCTestAssertionsImpl.h>

/*!
 * @function XCTFail(...)
 * Generates a failure unconditionally.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTFail(...) \
    _XCTPrimitiveFail(self, __VA_ARGS__)

/*!
 * @define XCTAssertNil(expression, ...)
 * Generates a failure when ((\a expression) != nil).
 * @param expression An expression of id type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNil(expression, ...) \
    _XCTPrimitiveAssertNil(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertNotNil(expression, ...)
 * Generates a failure when ((\a expression) == nil).
 * @param expression An expression of id type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNotNil(expression, ...) \
    _XCTPrimitiveAssertNotNil(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssert(expression, ...)
 * Generates a failure when ((\a expression) == false).
 * @param expression An expression of boolean type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssert(expression, ...) \
    _XCTPrimitiveAssertTrue(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertTrue(expression, ...)
 * Generates a failure when ((\a expression) == false).
 * @param expression An expression of boolean type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertTrue(expression, ...) \
    _XCTPrimitiveAssertTrue(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertFalse(expression, ...)
 * Generates a failure when ((\a expression) != false).
 * @param expression An expression of boolean type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertFalse(expression, ...) \
    _XCTPrimitiveAssertFalse(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertEqualObjects(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) not equal to (\a expression2)).
 * @param expression1 An expression of id type.
 * @param expression2 An expression of id type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertEqualObjects(expression1, expression2, ...) \
    _XCTPrimitiveAssertEqualObjects(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertNotEqualObjects(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) equal to (\a expression2)).
 * @param expression1 An expression of id type.
 * @param expression2 An expression of id type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNotEqualObjects(expression1, expression2, ...) \
    _XCTPrimitiveAssertNotEqualObjects(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertEqual(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) != (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertEqual(expression1, expression2, ...) \
    _XCTPrimitiveAssertEqual(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertNotEqual(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) == (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNotEqual(expression1, expression2, ...) \
    _XCTPrimitiveAssertNotEqual(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertEqualWithAccuracy(expression1, expression2, accuracy, ...)
 * Generates a failure when (difference between (\a expression1) and (\a expression2) is > (\a accuracy))).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param accuracy An expression of C scalar type describing the maximum difference between \a expression1 and \a expression2 for these values to be considered equal.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertEqualWithAccuracy(expression1, expression2, accuracy, ...) \
    _XCTPrimitiveAssertEqualWithAccuracy(self, expression1, @#expression1, expression2, @#expression2, accuracy, @#accuracy, __VA_ARGS__)

/*!
 * @define XCTAssertNotEqualWithAccuracy(expression1, expression2, accuracy, ...)
 * Generates a failure when (difference between (\a expression1) and (\a expression2) is <= (\a accuracy)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param accuracy An expression of C scalar type describing the maximum difference between \a expression1 and \a expression2 for these values to be considered equal.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNotEqualWithAccuracy(expression1, expression2, accuracy, ...) \
    _XCTPrimitiveAssertNotEqualWithAccuracy(self, expression1, @#expression1, expression2, @#expression2, accuracy, @#accuracy, __VA_ARGS__)

/*!
 * @define XCTAssertGreaterThan(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) <= (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertGreaterThan(expression1, expression2, ...) \
    _XCTPrimitiveAssertGreaterThan(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertGreaterThanOrEqual(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) < (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertGreaterThanOrEqual(expression1, expression2, ...) \
    _XCTPrimitiveAssertGreaterThanOrEqual(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertLessThan(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) >= (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertLessThan(expression1, expression2, ...) \
    _XCTPrimitiveAssertLessThan(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertLessThanOrEqual(expression1, expression2, ...)
 * Generates a failure when ((\a expression1) > (\a expression2)).
 * @param expression1 An expression of C scalar type.
 * @param expression2 An expression of C scalar type.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertLessThanOrEqual(expression1, expression2, ...) \
    _XCTPrimitiveAssertLessThanOrEqual(self, expression1, @#expression1, expression2, @#expression2, __VA_ARGS__)

/*!
 * @define XCTAssertThrows(expression, ...)
 * Generates a failure when ((\a expression) does not throw).
 * @param expression An expression.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertThrows(expression, ...) \
    _XCTPrimitiveAssertThrows(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertThrowsSpecific(expression, exception_class, ...)
 * Generates a failure when ((\a expression) does not throw \a exception_class).
 * @param expression An expression.
 * @param exception_class The class of the exception. Must be NSException, or a subclass of NSException.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertThrowsSpecific(expression, exception_class, ...) \
    _XCTPrimitiveAssertThrowsSpecific(self, expression, @#expression, exception_class, __VA_ARGS__)

/*!
 * @define XCTAssertThrowsSpecificNamed(expression, exception_class, exception_name, ...)
 * Generates a failure when ((\a expression) does not throw \a exception_class with \a exception_name).
 * @param expression An expression.
 * @param exception_class The class of the exception. Must be NSException, or a subclass of NSException.
 * @param exception_name The name of the exception.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertThrowsSpecificNamed(expression, exception_class, exception_name, ...) \
    _XCTPrimitiveAssertThrowsSpecificNamed(self, expression, @#expression, exception_class, exception_name, __VA_ARGS__)

/*!
 * @define XCTAssertNoThrow(expression, ...)
 * Generates a failure when ((\a expression) throws).
 * @param expression An expression.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNoThrow(expression, ...) \
    _XCTPrimitiveAssertNoThrow(self, expression, @#expression, __VA_ARGS__)

/*!
 * @define XCTAssertNoThrowSpecific(expression, exception_class, ...)
 * Generates a failure when ((\a expression) throws \a exception_class).
 * @param expression An expression.
 * @param exception_class The class of the exception. Must be NSException, or a subclass of NSException.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNoThrowSpecific(expression, exception_class, ...) \
    _XCTPrimitiveAssertNoThrowSpecific(self, expression, @#expression, exception_class, __VA_ARGS__)

/*!
 * @define XCTAssertNoThrowSpecificNamed(expression, exception_class, exception_name, ...)
 * Generates a failure when ((\a expression) throws \a exception_class with \a exception_name).
 * @param expression An expression.
 * @param exception_class The class of the exception. Must be NSException, or a subclass of NSException.
 * @param exception_name The name of the exception.
 * @param ... An optional supplementary description of the failure. A literal NSString, optionally with string format specifiers. This parameter can be completely omitted.
*/
#define XCTAssertNoThrowSpecificNamed(expression, exception_class, exception_name, ...) \
    _XCTPrimitiveAssertNoThrowSpecificNamed(self, expression, @#expression, exception_class, exception_name, __VA_ARGS__)
