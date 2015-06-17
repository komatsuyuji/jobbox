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

#include <dbi/dbi.h>
#include <dbi/dbi-dev.h>
#include "common.h"
#include "jbxlog.h"
#include "jbxconf.h"
#include "jbxdb.h"

/////////////////////////////////////////////////////////////////////////////////
static dbi_conn jx_conn = NULL;

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_create(jbxconf_t * cfg)
{
    if (jx_conn != NULL)
        return -1;
    if (cfg == NULL)
        return -1;

    jbxlog_debug("In %s() adapter: %s", __func__, cfg->dbadapter);
    dbi_initialize(NULL);
    jx_conn = dbi_conn_new(cfg->dbadapter);
    if (jx_conn == NULL) {
        jbxlog_error
            ("In %s() can not create database connection. adapter: %s",
             __func__, cfg->dbadapter);
        return -1;
    }

    dbi_conn_set_option(jx_conn, "host", cfg->dbhost);
    dbi_conn_set_option(jx_conn, "username", cfg->dbuser);
    dbi_conn_set_option(jx_conn, "password", cfg->dbpassword);
    dbi_conn_set_option(jx_conn, "dbname", cfg->dbname);
    dbi_conn_set_option(jx_conn, "encoding", cfg->dbencoding);

    // test database connect
    if (jbxdb_connect() != 0) {
        jbxlog_error("In %s() can not connect database connection",
                     __func__);
        return -1;
    }
    jbxdb_disconnect();
    jbxlog_debug("In %s() database is ok", __func__);

    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
void jbxdb_destroy(void)
{
    jbxlog_debug("In %s()", __func__);
    dbi_shutdown();
    jx_conn = NULL;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_connect(void)
{
    const char *errmsg = NULL;

    jbxlog_debug("In %s()", __func__);
    if (jx_conn == NULL)
        return -1;

    if (dbi_conn_connect(jx_conn) < 0) {
        dbi_conn_error(jx_conn, &errmsg);
        jbxlog_error("In %s() database connect error. %s", __func__,
                     errmsg);
        return -1;
    }

    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
void jbxdb_disconnect(void)
{
    dbi_conn_t *conn = NULL;

    jbxlog_debug("In %s()", __func__);
    if (jx_conn == NULL)
        return;

    conn = jx_conn;
    conn->driver->functions->disconnect(conn);
    conn->connection = NULL;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
dbi_result jbxdb_query(const char *sql)
{
    dbi_result result = NULL;
    const char *errmsg = NULL;

    // check db connect and sql
    jbxlog_trace("In %s()", __func__);
    if (jx_conn == NULL || sql == NULL)
        return;

    // query sql
    jbxlog_trace("In %s() sql: %s", __func__, sql);
    result = dbi_conn_query(jx_conn, sql);
    if (result == NULL) {
        dbi_conn_error(jx_conn, &errmsg);
        jbxlog_error("In %s() sql '%s' is error. %s", __func__, sql,
                     errmsg);
    }

    return result;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
dbi_result jbxdb_query_valist(const char *fmt, va_list va)
{
    char *sql = NULL;
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    // create sql
    sql = jbx_dformat(fmt, va);
    if (sql == NULL)
        return NULL;

    // query sql
    jbxlog_trace("In %s() sql: %s", __func__, sql);
    result = jbxdb_query(sql);

    jbx_free(sql);
    return result;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_begin(void)
{
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    result = jbxdb_query("BEGIN");
    if (result == NULL)
        return -1;

    dbi_result_free(result);
    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_commit(void)
{
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    result = jbxdb_query("COMMIT");
    if (result == NULL)
        return -1;

    dbi_result_free(result);
    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_rollback(void)
{
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    result = jbxdb_query("ROLLBACK");
    if (result == NULL)
        return -1;

    dbi_result_free(result);
    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
dbi_result jbxdb_select(const char *fmt, ...)
{
    va_list va;
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    va_start(va, fmt);
    result = jbxdb_query_valist(fmt, va);
    va_end(va);

    return result;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
apr_uint64_t jbxdb_insert(const char *fmt, ...)
{
    apr_uint64_t id;
    va_list va;
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    va_start(va, fmt);
    result = jbxdb_query_valist(fmt, va);
    va_end(va);

    if (result == NULL)
        return 0;

    id = dbi_conn_sequence_last(jx_conn, NULL);

    dbi_result_free(result);
    return id;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
int jbxdb_execute(const char *fmt, ...)
{
    va_list va;
    dbi_result result = NULL;

    jbxlog_trace("In %s()", __func__);
    va_start(va, fmt);
    result = jbxdb_query_valist(fmt, va);
    va_end(va);

    if (result == NULL)
        return -1;

    dbi_result_free(result);
    return 0;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
char *jbxdb_get_string(dbi_result result, const char *fieldname)
{
    const char *value;
    char *str;

    value = dbi_result_get_string(result, fieldname);
    if (value) {
        str = strdup(value);
    } else {
        str = strdup("");
    }

    return str;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
time_t jbxdb_get_datetime(dbi_result result, const char *fieldname)
{
    time_t t;

    t = dbi_result_get_datetime(result, fieldname);
    if (t <= 0)
        return 0;

    return mktime(gmtime(&t));
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
char *jbxdb_escape_datetime(const time_t t)
{
    char *t_str;
    char *str;

    jbxlog_trace("In %s()", __func__);
    if (t <= 0) {
        str = strdup("NULL");
        return str;
    }

    str = (char *) malloc(22);
    t_str = jbx_time2str(t);

    snprintf(str, 22, "'%s'", t_str);

    jbx_free(t_str);
    return str;
}

/////////////////////////////////////////////////////////////////////////////////
//
// Function:
//
// Purpose:
//
// Parameters:
//
// Return value:
//
// Author: Komatsu Yuji(Zheng Chuyu)
//
/////////////////////////////////////////////////////////////////////////////////
char *jbxdb_escape_string(char *str)
{
    apr_size_t n;
    char *newstr = NULL;

    jbxlog_trace("In %s()", __func__);
    if (jx_conn == NULL)
        return NULL;

    if (str == NULL) {
        newstr = strdup("");
        return newstr;
    }

    n = dbi_conn_escape_string_copy(jx_conn, str, &newstr);

    if (strlen(str) > 0 && n == 0) {
        jbx_free(newstr);
        return NULL;
    }

    return newstr;
}
