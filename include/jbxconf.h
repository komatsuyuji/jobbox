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

#ifndef JOBBOX_JBXCONF_H
#define JOBBOX_JBXCONF_H

typedef struct {
    char *pidfile;
    char *logfile;
    int loglevel;
    int logrotate;
    int logsize;
    char *tmpdir;
    char *dbadapter;
    char *dbhost;
    char *dbname;
    char *dbuser;
    char *dbpassword;
    char *dbencoding;
    char *joblogfile;
} jbxconf_t;

int jbxconf_create(const char *conffile);
void jbxconf_destroy(void);
jbxconf_t *jbxconf_get(void);

#endif
