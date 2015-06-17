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

#ifndef JOBBOX_JBXDB_H
#define JOBBOX_JBXDB_H

#include <apr_portable.h>
#include <dbi/dbi.h>
#include "jbxconf.h"

// connection
int jbxdb_create(jbxconf_t * cfg);
void jbxdb_destroy(void);
int jbxdb_connect(void);
void jbxdb_disconnect(void);

// basic db query 
dbi_result jbxdb_query(const char *sql);
dbi_result jbxdb_query_valist(const char *fmt, va_list va);

int jbxdb_begin(void);
int jbxdb_commit(void);
int jbxdb_rollback(void);

dbi_result jbxdb_select(const char *fmt, ...);
apr_uint64_t jbxdb_insert(const char *fmt, ...);
int jbxdb_execute(const char *fmt, ...);

char *jbxdb_get_string(dbi_result result, const char *fieldname);
time_t jbxdb_get_datetime(dbi_result result, const char *fieldname);

char *jbxdb_escape_datetime(const time_t t);
char *jbxdb_escape_string(char *str);

#endif
