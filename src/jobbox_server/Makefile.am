sbin_PROGRAMS = jobbox_server

SUBDIRS = \
    expander \
    loader \
    bootstrap \
    executive \
    monitor \
    housekeeper

DIST_SUBDIRS = $(SUBDIRS)

jobbox_server_SOURCES = \
    server.c

jobbox_server_LDADD = \
    $(top_srcdir)/src/jobbox_server/loader/libloader.a \
    $(top_srcdir)/src/jobbox_server/expander/libexpander.a \
    $(top_srcdir)/src/jobbox_server/bootstrap/libbootstrap.a \
    $(top_srcdir)/src/jobbox_server/executive/libexecutive.a \
    $(top_srcdir)/src/jobbox_server/monitor/libmonitor.a \
    $(top_srcdir)/src/jobbox_server/housekeeper/libhousekeeper.a \
    $(top_srcdir)/src/libs/models/libjbxmodels.a \
    $(top_srcdir)/src/libs/network/libjbxnetwork.a \
    $(top_srcdir)/src/libs/basic/libjbxbasic.a \
    $(top_srcdir)/src/libs/common/libjbxcommon.a
