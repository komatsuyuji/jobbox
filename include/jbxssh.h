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

#ifndef JOBBOX_JBXSSH_H
#define JOBBOX_JBXSSH_H

#include <libssh2.h>
#include "common.h"
#include "jobresult.h"

typedef struct {
    apr_pool_t *pool;
    apr_os_sock_t socket;
    LIBSSH2_SESSION *session;
    LIBSSH2_CHANNEL *channel;
} jbxssh_t;

jbxssh_t *jbxssh_new(void);
void jbxssh_destroy(jbxssh_t * obj);
int jbxssh_init(jbxssh_t * obj);

int jbxssh_session(jbxssh_t * obj, const char *host, const int port);
int jbxssh_userauth_password(jbxssh_t * obj, const char *user,
                             const char *password);
int jbxssh_userauth_publickey(jbxssh_t * obj, const char *user,
                              const char *privatekey,
                              const char *passphrase);
int jbxssh_channel(jbxssh_t * obj);
int jbxssh_exec(jbxssh_t * obj, jobresult_t * obj_jobres,
                const char *command);

#endif
