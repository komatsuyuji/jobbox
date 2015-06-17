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

#include "common.h"
#include "jbxlog.h"
#include "jbxdb.h"
#include "models.h"

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
vardatum_t *vardatum_new(void)
{
    vardatum_t *obj;

    jbxlog_trace("In %s()", __func__);

    obj = (vardatum_t *) malloc(sizeof(vardatum_t));
    obj->name = NULL;
    obj->value = NULL;
    vardatum_init(obj);

    return obj;
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
void vardatum_destroy(vardatum_t * obj)
{
    jbxlog_trace("In %s()", __func__);

    if (obj == NULL)
        return;

    vardatum_init(obj);
    jbx_free(obj);

    obj = NULL;
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
int vardatum_init(vardatum_t * obj)
{
    jbxlog_trace("In %s()", __func__);

    if (obj == NULL)
        return -1;

    jbx_free(obj->name);
    jbx_free(obj->value);

    obj->id = 0;
    obj->jobunit_id = 0;
    obj->proc_jobunit_id = 0;
    obj->hist_jobunit_id = 0;
    obj->name = NULL;
    obj->value = NULL;
    obj->overwrite = 1;

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
int vardatum_load(vardatum_t * obj, dbi_result res)
{
    jbxlog_trace("In %s()", __func__);
    if (obj == NULL || res == NULL)
        return -1;

    vardatum_init(obj);

    obj->id = dbi_result_get_ulonglong(res, "id");
    obj->jobunit_id = dbi_result_get_ulonglong(res, "jobunit_id");
    obj->proc_jobunit_id =
        dbi_result_get_ulonglong(res, "proc_jobunit_id");
    obj->hist_jobunit_id =
        dbi_result_get_ulonglong(res, "hist_jobunit_id");

    obj->name = jbxdb_get_string(res, "name");
    obj->value = jbxdb_get_string(res, "value");
    obj->overwrite = dbi_result_get_int(res, "overwrite");

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
apr_uint64_t proc_vardatum_insert(vardatum_t * obj)
{
    apr_uint64_t id;
    char *esc_name = NULL;
    char *esc_value = NULL;

    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return 0;

    // escape strinq
    esc_name = jbxdb_escape_string(obj->name);
    esc_value = jbxdb_escape_string(obj->value);

    id = jbxdb_insert
        ("INSERT INTO proc_vardata(proc_jobunit_id, name, value, overwrite) VALUES(%llu, '%s', '%s', %d)",
         obj->proc_jobunit_id, esc_name, esc_value, obj->overwrite);
    obj->id = id;

    jbx_free(esc_name);
    jbx_free(esc_value);
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
apr_uint64_t hist_vardatum_insert(vardatum_t * obj)
{
    apr_uint64_t id;
    char *esc_name = NULL;
    char *esc_value = NULL;

    jbxlog_trace("In %s()", __func__);
    if (obj == NULL)
        return 0;

    // escape strinq
    esc_name = jbxdb_escape_string(obj->name);
    esc_value = jbxdb_escape_string(obj->value);

    id = jbxdb_insert
        ("INSERT INTO hist_vardata(hist_jobunit_id, name, value, overwrite) VALUES(%llu, '%s', '%s', %d)",
         obj->hist_jobunit_id, esc_name, esc_value, obj->overwrite);
    obj->id = id;

    jbx_free(esc_name);
    jbx_free(esc_value);
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
int vardata_put_process(const apr_uint64_t jobunit_id,
                        const apr_uint64_t proc_jobunit_id)
{
    int rc;
    vardatum_t *obj;
    dbi_result result;

    jbxlog_debug("In %s() jobunit_id: %llu, proc_jobunit_id: %llu",
                 __func__, jobunit_id, proc_jobunit_id);

    result =
        jbxdb_select("SELECT * FROM vardata WHERE jobunit_id = %llu",
                     jobunit_id);
    if (result == NULL)
        return -1;

    rc = -1;
    obj = vardatum_new();
    while (dbi_result_next_row(result)) {
        vardatum_load(obj, result);
        obj->proc_jobunit_id = proc_jobunit_id;
        if (proc_vardatum_insert(obj) == 0)
            goto error;
    }

    rc = 0;
  error:
    vardatum_destroy(obj);
    dbi_result_free(result);
    return rc;
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
int vardata_put_history(const apr_uint64_t proc_jobunit_id,
                        const apr_uint64_t hist_jobunit_id)
{
    int rc;
    vardatum_t *obj;
    dbi_result result;

    jbxlog_debug("In %s() proc_jobunit_id: %llu, hist_jobunit_id: %llu",
                 __func__, proc_jobunit_id, hist_jobunit_id);

    result =
        jbxdb_select
        ("SELECT * FROM proc_vardata WHERE proc_jobunit_id = %llu",
         proc_jobunit_id);
    if (result == NULL)
        return -1;

    rc = -1;
    obj = vardatum_new();
    while (dbi_result_next_row(result)) {
        vardatum_load(obj, result);
        obj->hist_jobunit_id = hist_jobunit_id;
        if (hist_vardatum_insert(obj) == 0)
            goto error;
    }

    rc = 0;
  error:
    vardatum_destroy(obj);
    dbi_result_free(result);
    return rc;
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
int proc_vardata_delete(const apr_uint64_t proc_jobunit_id)
{
    jbxlog_trace("In %s()", __func__);

    return
        jbxdb_execute
        ("DELETE FROM proc_vardata WHERE proc_jobunit_id = %llu",
         proc_jobunit_id);
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
int hist_vardata_delete(const apr_uint64_t hist_jobunit_id)
{
    jbxlog_trace("In %s()", __func__);
    return
        jbxdb_execute
        ("DELETE FROM hist_vardata WHERE hist_jobunit_id = %llu",
         hist_jobunit_id);
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
int vardata_execute(jobunit_t * proc_jobunit)
{
    int rc;
    dbi_result result;
    vardatum_t *obj = NULL;

    if (proc_jobunit == NULL)
        return -1;

    jbxlog_trace("In %s() proc_jobunit_id: %llu, parent_id: %llu",
                 __func__, proc_jobunit->id, proc_jobunit->parent_id);

    result =
        jbxdb_select
        ("SELECT * FROM proc_vardata WHERE proc_jobunit_id = %llu",
         proc_jobunit->id);
    if (result == NULL)
        return -1;

    // init
    rc = -1;
    obj = vardatum_new();

    while (dbi_result_next_row(result)) {
        vardatum_load(obj, result);
        if (proc_variable_overwrite
            (proc_jobunit->parent_id, obj->name, obj->value,
             obj->overwrite) != 0)
            goto error;
    }

    rc = 0;
  error:
    vardatum_destroy(obj);
    dbi_result_free(result);
    if (rc == 0) {
        rc = proc_jobunit_set_end(proc_jobunit, CONNECTOR_KIND_NORMAL);
    }
    return rc;
}
