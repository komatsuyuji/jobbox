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

#ifndef JOBBOX_JBXWSMAN_H
#define JOBBOX_JBXWSMAN_H

#include <wsman-api.h>
#include "jobresult.h"

#define XML_NS_RSP "http://schemas.microsoft.com/wbem/wsman/1/windows/shell"
#define XML_NSDATA_RSP "rsp"
#define XML_NS_P "http://schemas.microsoft.com/wbem/wsman/1/wsman.xsd"
#define XML_NSDATA_P "p"
#define XML_NS_CFG "http://schemas.microsoft.com/wbem/wsman/1/config"
#define XML_NSDATA_CFG "cfg"

#define RESOURCE_URI_CMD "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/cmd"
#define ACTION_COMMAND "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Command"
#define ACTION_RECEIVE "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Receive"
#define ACTION_SIGNAL "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/Signal"
#define ACTION_DELETE "http://schemas.xmlsoap.org/ws/2004/09/transfer/Delete"
#define RSP_CODE "http://schemas.microsoft.com/wbem/wsman/1/windows/shell/signal/terminate"

#define XML_LANG "xml:lang"
#define MS_WORKING_DIRECTORY "WorkingDirectory"
#define MS_IDLE_TIME_OUT "IdleTimeOut"
#define MS_SHELL "Shell"
#define MS_INPUT_STREAMS "InputStreams"
#define MS_OUTPUT_STREAMS "OutputStreams"
#define MS_DATA_LOCALE "DataLocale"
#define MS_COMMAND_LINE "CommandLine"
#define MS_COMMAND "Command"
#define MS_RECEIVE "Receive"
#define MS_DESIRED_STREAM "DesiredStream"
#define MS_SIGNAL "Signal"
#define MS_CODE "Code"

#define JBX_WSMAN_SIZE 256

typedef struct {
    WsManClient *client;
    char shell_id[JBX_WSMAN_SIZE];
    char command_id[JBX_WSMAN_SIZE];
    int command_done;
    char errmsg[JBX_WSMAN_SIZE];
} jbxwsman_t;

jbxwsman_t *jbxwsman_new(void);
void jbxwsman_destroy(jbxwsman_t * obj);
int jbxwsman_init(jbxwsman_t * obj);
int jbxwsman_set(jbxwsman_t * obj, const char *user, const char *password,
                 const char *scheme, const char *host, const int port,
                 const char *path, const char *auth);

WsXmlDocH jbxwsman_send(jbxwsman_t * obj, WsXmlDocH request);
int jbxwsman_soap_header(jbxwsman_t * obj, WsXmlDocH doc,
                         const char *action, const char *resource_uri,
                         const char *shell_id, const char *message_id);
int jbxwsman_open_shell(jbxwsman_t * obj, const char *i_stream,
                        const char *o_stream,
                        const char *working_directory,
                        const char *env_vars, const char *noprofile,
                        const int codepage, const char *idle_timeout);
int jbxwsman_run_command(jbxwsman_t * obj, const char *command,
                         const char *console_mode_stdin,
                         const char *skip_cmd_shell);
int jbxwsman_raw_get_command_output(jbxwsman_t * obj,
                                    jobresult_t * obj_jobres,
                                    const int codepage);
int jbxwsman_get_command_output(jbxwsman_t * obj, jobresult_t * obj_jobres,
                                const int codepage);
int jbxwsman_cleanup_command(jbxwsman_t * obj);
int jbxwsman_close_shell(jbxwsman_t * obj);

int jbxwsman_exec(jbxwsman_t * obj, jobresult_t * obj_jobres,
                  const char *command, const int codepage);

#endif
