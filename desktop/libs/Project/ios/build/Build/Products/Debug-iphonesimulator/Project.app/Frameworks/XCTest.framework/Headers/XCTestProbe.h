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

#import <Foundation/Foundation.h>

#import <XCTest/XCTestDefines.h>

XCT_EXPORT int XCTSelfTestMain(void) DEPRECATED_ATTRIBUTE;

DEPRECATED_ATTRIBUTE
@interface XCTestProbe : NSObject

+ (BOOL)isTesting;

@end

XCT_EXPORT NSString * const XCTestedUnitPath DEPRECATED_ATTRIBUTE;
XCT_EXPORT NSString * const XCTestScopeKey DEPRECATED_ATTRIBUTE;
XCT_EXPORT NSString * const XCTestScopeAll DEPRECATED_ATTRIBUTE;
XCT_EXPORT NSString * const XCTestScopeNone DEPRECATED_ATTRIBUTE;
XCT_EXPORT NSString * const XCTestScopeSelf DEPRECATED_ATTRIBUTE;
XCT_EXPORT NSString * const XCTestToolKey DEPRECATED_ATTRIBUTE;
