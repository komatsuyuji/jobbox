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

#ifndef JOBBOX_JBXJOBLOG_H
#define JOBBOX_JBXJOBLOG_H

#include <apr_portable.h>
#include "models.h"

typedef struct {
    apr_pool_t *pool;
    apr_file_t *fp;
    char *joblogfile;
    char today[9];
    char *logfile;
} jbxjoblog_t;

int jbxjoblog_create(char *joblogfile);
void jbxjoblog_destroy(void);

int jbxjoblog_open(void);
void jbxjoblog_close(void);
void jbxjoblog_lock(void);
void jbxjoblog_unlock(void);
int jbxjoblog_filechk(void);

const char *jbxjoblog_kind(int kind);
const char *jbxjoblog_status(int status);
const char *jbxjoblog_timeout_occur(int timeout_occur);

int jbxjoblog_write(const char *message);
int jbxjoblog_jobunit(jobunit_t * obj);

#endif
