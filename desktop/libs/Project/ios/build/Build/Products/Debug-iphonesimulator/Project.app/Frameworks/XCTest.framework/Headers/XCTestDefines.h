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

#if defined(__cplusplus)
    #define XCT_EXPORT extern "C"
#else
    #define XCT_EXPORT extern
#endif

#if __has_feature(objc_generics)
#define XCT_GENERICS_AVAILABLE 1
#endif

#if __has_feature(nullability)
#define XCT_NULLABLE_AVAILABLE 1
#endif

#if (!defined(__OBJC_GC__) || (defined(__OBJC_GC__) && ! __OBJC_GC__)) && (defined(__OBJC2__) && __OBJC2__) && (!defined (TARGET_OS_WATCH) || (defined(TARGET_OS_WATCH) && ! TARGET_OS_WATCH))
#ifndef XCT_UI_TESTING_AVAILABLE
#define XCT_UI_TESTING_AVAILABLE 1
#endif
#endif

#ifndef XCT_NULLABLE_AVAILABLE
#define XCT_NULLABLE_AVAILABLE 0
#endif

#ifndef XCT_GENERICS_AVAILABLE
#define XCT_GENERICS_AVAILABLE 0
#endif

#ifndef XCT_UI_TESTING_AVAILABLE
#define XCT_UI_TESTING_AVAILABLE 0
#endif

#if TARGET_OS_SIMULATOR
#define XCTEST_SIMULATOR_UNAVAILABLE(_msg) __attribute__((availability(ios,unavailable,message=_msg)))
#else
#define XCTEST_SIMULATOR_UNAVAILABLE(_msg)
#endif
