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

#include <getopt.h>
#include "common.h"
#include "jbxarg.h"

/////////////////////////////////////////////////////////////////////////////////
static jbxarg_t *jx_arg = NULL;

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
int jbxarg_create(int argc, char **argv)
{
    int rc;
    int opt, option_index;
    struct option long_options[] = {
        {"config", required_argument, 0, 'c'},
        {"help", no_argument, 0, 'h'},
        {"version", no_argument, 0, 'v'},
        {0, 0, 0, 0}
    };

    if (jx_arg != NULL)
        return -1;

    rc = 0;
    jx_arg = (jbxarg_t *) malloc(sizeof(jbxarg_t));
    jx_arg->config = NULL;
    while ((opt =
            getopt_long(argc, argv, "c:hv", long_options,
                        &option_index)) != -1) {
        switch (opt) {
        case 'c':
            jx_arg->config = strdup(optarg);
            break;
        case 'h':
            jbxarg_help();
            rc = 1;
            break;
        case 'v':
            jbxarg_version();
            rc = 1;
            break;
        default:
            jbxarg_help();
            rc = -1;
            break;
        }
    }

    if (rc != 0)
        return rc;

    if (jx_arg->config == NULL)
        jx_arg->config = strdup("jobbox_server.conf");

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
void jbxarg_destroy(void)
{
    if (jx_arg == NULL)
        return;

    jbx_free(jx_arg->config);
    jx_arg->config = NULL;

    jbx_free(jx_arg);
    jx_arg = NULL;
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
jbxarg_t *jbxarg_get(void)
{
    return jx_arg;
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
void jbxarg_version(void)
{
    printf("%s v%s\n", APPLICATION_NAME, JOBBOX_VERSION);
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
void jbxarg_help(void)
{
    char *help_msg[] = {
        "Options:",
        "  -c --config <file>              Absolute path to the configuration file",
        "  -h --help                       Give this help",
        "  -v --version                    Display version number",
        NULL
    };
    char **p = help_msg;

    jbxarg_version();
    while (*p != NULL) {
        printf("%s\n", *p++);
    }
}
