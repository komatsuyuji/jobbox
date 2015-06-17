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
#include "jbxarg.h"
#include "jbxconf.h"
#include "jbxlog.h"
#include "jbxjoblog.h"
#include "jbxpid.h"
#include "jbxdb.h"

#include "expander/expander.h"
#include "loader/loader.h"
#include "bootstrap/bootstrap.h"
#include "executive/executive.h"
#include "monitor/monitor.h"
#include "housekeeper/housekeeper.h"

/////////////////////////////////////////////////////////////////////////////////
apr_pool_t *jx_pool = NULL;
pid_t jx_pid = -1;

int jx_expander_forks = 1;
int jx_loader_forks = 1;
int jx_bootstrap_forks = 1;
int jx_executive_forks = 1;
int jx_monitor_forks = 1;
int jx_housekeeper_forks = 1;

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
static void jobbox_on_exit()
{
    if (jx_pid != getpid())
        return;

    jbxlog_info("Stopping Jobbox Server");
    jbxpid_destroy();
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
static void jobbox_children_start(void)
{
    int i, status;
    int children_num;
    int forks = 0;

    jbxlog_debug("In %s()", __func__);
    children_num =
        jx_loader_forks + jx_expander_forks + jx_bootstrap_forks +
        jx_executive_forks + jx_monitor_forks + jx_housekeeper_forks;

    for (i = 0; i < children_num; i++) {
        if (jbx_fork() == 0)
            break;
    }

    jbxlog_debug("In %s() child process #%d started. pid: %d",
                 __func__, i, getpid());
    if (i >= 0 && i < (forks += jx_loader_forks)) {
        loader_mainloop();
    } else if (i < (forks += jx_expander_forks)) {
        expander_mainloop();
    } else if (i < (forks += jx_bootstrap_forks)) {
        bootstrap_mainloop();
    } else if (i < (forks += jx_executive_forks)) {
        executive_mainloop();
    } else if (i < (forks += jx_monitor_forks)) {
        monitor_mainloop();
    } else if (i < (forks += jx_housekeeper_forks)) {
        housekeeper_mainloop();
    } else if (i == children_num) {
        jbxlog_debug("In %s() parent process waiting ...", __func__);
        wait(&status);
    }
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
int main(int argc, char **argv)
{
    int rc;
    jbxarg_t *argument;
    jbxconf_t *cfg;

    rc = -1;
    apr_initialize();
    apr_pool_create(&jx_pool, NULL);
    apr_signal_init(jx_pool);

    // load command line
    if (jbxarg_create(argc, argv) != 0)
        goto error;
    argument = jbxarg_get();

    // load config file
    if (jbxconf_create(argument->config) != 0)
        goto error;
    cfg = jbxconf_get();

    // log
    if (jbxlog_create(cfg) != 0)
        goto error;
    if (jbxlog_open() != 0)
        goto error;

    // logging the basic information
    jbxlog_info("Starting Jobbox Server. %s v%s",
                APPLICATION_NAME, JOBBOX_VERSION);
    jbxlog_info("Using configuration file. %s", argument->config);

    // joblog
    if (jbxjoblog_create(cfg->joblogfile) != 0)
        goto error;
    if (jbxjoblog_open() != 0)
        goto error;

    // database
    if (jbxdb_create(cfg) != 0)
        goto error;

    // start daemon
    apr_proc_detach(APR_PROC_DETACH_DAEMONIZE);

    // parent process
    jx_pid = getpid();
    if (jbxpid_create(cfg->pidfile) != 0) {
        jbxlog_crit("In %s() can not create pidfile. %s", __func__,
                    cfg->pidfile);
        goto error;
    }

    atexit(jobbox_on_exit);
    jbx_set_signal_handler();
    jobbox_children_start();

    rc = 0;
  error:
    jbxdb_destroy();
    jbxjoblog_destroy();
    jbxlog_destroy();
    jbxconf_destroy();
    jbxarg_destroy();

    apr_terminate();
    exit(rc);
}
