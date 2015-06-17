/////////////////////////////////////////////////////////////////////////////////
//
// Jobbox
// Copyright (C) 2014-2015 Komatsu Yuji(Zheng Chuyu)
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
/////////////////////////////////////////////////////////////////////////////////

#ifndef JOBBOX_JBXLOG_H
#define JOBBOX_JBXLOG_H

#include <apr_portable.h>
#include "jbxconf.h"

#define LOG_LEVEL_UNKNOWN 0
#define LOG_LEVEL_TRACE   1
#define LOG_LEVEL_DEBUG   2
#define LOG_LEVEL_INFO    3
#define LOG_LEVEL_NOTICE  4
#define LOG_LEVEL_WARN    5
#define LOG_LEVEL_ERROR   6
#define LOG_LEVEL_CRIT    7
#define LOG_LEVEL_ALERT   8
#define LOG_LEVEL_FATAL   9

typedef struct {
    apr_pool_t *pool;
    apr_file_t *fp;
    char *logfile;
    int loglevel;
    apr_off_t logsize;
} jbxlog_t;

int jbxlog_create(jbxconf_t * cfg);
void jbxlog_destroy(void);
int jbxlog_open(void);
void jbxlog_close(void);
void jbxlog_lock(void);
void jbxlog_unlock(void);

int jbxlog_rotate(void);
int jbxlog_write(const char *message);
int jbxlog_append(const int level, const char *fmt, va_list va);
int jbxlog_trace(const char *fmt, ...);
int jbxlog_debug(const char *fmt, ...);
int jbxlog_info(const char *fmt, ...);
int jbxlog_warn(const char *fmt, ...);
int jbxlog_error(const char *fmt, ...);
int jbxlog_crit(const char *fmt, ...);

#endif
