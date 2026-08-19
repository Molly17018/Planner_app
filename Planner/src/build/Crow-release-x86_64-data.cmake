########### AGGREGATED COMPONENTS AND DEPENDENCIES FOR THE MULTI CONFIG #####################
#############################################################################################

set(crowcpp-crow_COMPONENT_NAMES "")
if(DEFINED crowcpp-crow_FIND_DEPENDENCY_NAMES)
  list(APPEND crowcpp-crow_FIND_DEPENDENCY_NAMES asio)
  list(REMOVE_DUPLICATES crowcpp-crow_FIND_DEPENDENCY_NAMES)
else()
  set(crowcpp-crow_FIND_DEPENDENCY_NAMES asio)
endif()
set(asio_FIND_MODE "NO_MODULE")

########### VARIABLES #######################################################################
#############################################################################################
set(crowcpp-crow_PACKAGE_FOLDER_RELEASE "C:/Users/liens/.conan2/p/crowcbe8fafe5b58a8/p")
set(crowcpp-crow_BUILD_MODULES_PATHS_RELEASE )


set(crowcpp-crow_INCLUDE_DIRS_RELEASE "${crowcpp-crow_PACKAGE_FOLDER_RELEASE}/include")
set(crowcpp-crow_RES_DIRS_RELEASE )
set(crowcpp-crow_DEFINITIONS_RELEASE )
set(crowcpp-crow_SHARED_LINK_FLAGS_RELEASE )
set(crowcpp-crow_EXE_LINK_FLAGS_RELEASE )
set(crowcpp-crow_OBJECTS_RELEASE )
set(crowcpp-crow_COMPILE_DEFINITIONS_RELEASE )
set(crowcpp-crow_COMPILE_OPTIONS_C_RELEASE )
set(crowcpp-crow_COMPILE_OPTIONS_CXX_RELEASE )
set(crowcpp-crow_LIB_DIRS_RELEASE )
set(crowcpp-crow_BIN_DIRS_RELEASE )
set(crowcpp-crow_LIBRARY_TYPE_RELEASE UNKNOWN)
set(crowcpp-crow_IS_HOST_WINDOWS_RELEASE 1)
set(crowcpp-crow_LIBS_RELEASE )
set(crowcpp-crow_SYSTEM_LIBS_RELEASE wsock32 ws2_32)
set(crowcpp-crow_FRAMEWORK_DIRS_RELEASE )
set(crowcpp-crow_FRAMEWORKS_RELEASE )
set(crowcpp-crow_BUILD_DIRS_RELEASE )
set(crowcpp-crow_NO_SONAME_MODE_RELEASE FALSE)


# COMPOUND VARIABLES
set(crowcpp-crow_COMPILE_OPTIONS_RELEASE
    "$<$<COMPILE_LANGUAGE:CXX>:${crowcpp-crow_COMPILE_OPTIONS_CXX_RELEASE}>"
    "$<$<COMPILE_LANGUAGE:C>:${crowcpp-crow_COMPILE_OPTIONS_C_RELEASE}>")
set(crowcpp-crow_LINKER_FLAGS_RELEASE
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,SHARED_LIBRARY>:${crowcpp-crow_SHARED_LINK_FLAGS_RELEASE}>"
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,MODULE_LIBRARY>:${crowcpp-crow_SHARED_LINK_FLAGS_RELEASE}>"
    "$<$<STREQUAL:$<TARGET_PROPERTY:TYPE>,EXECUTABLE>:${crowcpp-crow_EXE_LINK_FLAGS_RELEASE}>")


set(crowcpp-crow_COMPONENTS_RELEASE )