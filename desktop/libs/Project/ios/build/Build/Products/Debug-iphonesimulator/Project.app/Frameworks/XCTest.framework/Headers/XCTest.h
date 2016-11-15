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
#import <XCTest/XCTestErrors.h>

#import <XCTest/XCAbstractTest.h>
#import <XCTest/XCTestAssertions.h>
#import <XCTest/XCTestAssertionsImpl.h>
#import <XCTest/XCTestCase.h>
#import <XCTest/XCTestCase+AsynchronousTesting.h>
#import <XCTest/XCTestCaseRun.h>
#import <XCTest/XCTestLog.h>
#import <XCTest/XCTestObserver.h>
#import <XCTest/XCTestObservationCenter.h>
#import <XCTest/XCTestObservation.h>
#import <XCTest/XCTestProbe.h>
#import <XCTest/XCTestRun.h>
#import <XCTest/XCTestSuite.h>
#import <XCTest/XCTestSuiteRun.h>

#import <XCTest/XCUIApplication.h>
#import <XCTest/XCUIDevice.h>
#import <XCTest/XCUICoordinate.h>
#import <XCTest/XCUIElement.h>
#import <XCTest/XCUIElementQuery.h>
#import <XCTest/XCUIElementTypes.h>
#import <XCTest/XCUIElementAttributes.h>
#import <XCTest/XCUIElementTypeQueryProvider.h>
#import <XCTest/XCUIKeyboardKeys.h>
#import <XCTest/XCUIRemote.h>
