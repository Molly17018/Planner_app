# Avoid multiple calls to find_package to append duplicated properties to the targets
include_guard()########### VARIABLES #######################################################################
#############################################################################################
set(crowcpp-crow_FRAMEWORKS_FOUND_RELEASE "") # Will be filled later
conan_find_apple_frameworks(crowcpp-crow_FRAMEWORKS_FOUND_RELEASE "${crowcpp-crow_FRAMEWORKS_RELEASE}" "${crowcpp-crow_FRAMEWORK_DIRS_RELEASE}")

set(crowcpp-crow_LIBRARIES_TARGETS "") # Will be filled later


######## Create an interface target to contain all the dependencies (frameworks, system and conan deps)
if(NOT TARGET crowcpp-crow_DEPS_TARGET)
    add_library(crowcpp-crow_DEPS_TARGET INTERFACE IMPORTED)
endif()

set_property(TARGET crowcpp-crow_DEPS_TARGET
             APPEND PROPERTY INTERFACE_LINK_LIBRARIES
             $<$<CONFIG:Release>:${crowcpp-crow_FRAMEWORKS_FOUND_RELEASE}>
             $<$<CONFIG:Release>:${crowcpp-crow_SYSTEM_LIBS_RELEASE}>
             $<$<CONFIG:Release>:asio::asio>)

####### Find the libraries declared in cpp_info.libs, create an IMPORTED target for each one and link the
####### crowcpp-crow_DEPS_TARGET to all of them
conan_package_library_targets("${crowcpp-crow_LIBS_RELEASE}"    # libraries
                              "${crowcpp-crow_LIB_DIRS_RELEASE}" # package_libdir
                              "${crowcpp-crow_BIN_DIRS_RELEASE}" # package_bindir
                              "${crowcpp-crow_LIBRARY_TYPE_RELEASE}"
                              "${crowcpp-crow_IS_HOST_WINDOWS_RELEASE}"
                              crowcpp-crow_DEPS_TARGET
                              crowcpp-crow_LIBRARIES_TARGETS  # out_libraries_targets
                              "_RELEASE"
                              "crowcpp-crow"    # package_name
                              "${crowcpp-crow_NO_SONAME_MODE_RELEASE}")  # soname

# FIXME: What is the result of this for multi-config? All configs adding themselves to path?
set(CMAKE_MODULE_PATH ${crowcpp-crow_BUILD_DIRS_RELEASE} ${CMAKE_MODULE_PATH})

########## GLOBAL TARGET PROPERTIES Release ########################################
    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_LINK_LIBRARIES
                 $<$<CONFIG:Release>:${crowcpp-crow_OBJECTS_RELEASE}>
                 $<$<CONFIG:Release>:${crowcpp-crow_LIBRARIES_TARGETS}>
                 )

    if("${crowcpp-crow_LIBS_RELEASE}" STREQUAL "")
        # If the package is not declaring any "cpp_info.libs" the package deps, system libs,
        # frameworks etc are not linked to the imported targets and we need to do it to the
        # global target
        set_property(TARGET Crow::Crow
                     APPEND PROPERTY INTERFACE_LINK_LIBRARIES
                     crowcpp-crow_DEPS_TARGET)
    endif()

    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_LINK_OPTIONS
                 $<$<CONFIG:Release>:${crowcpp-crow_LINKER_FLAGS_RELEASE}>)
    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_INCLUDE_DIRECTORIES
                 $<$<CONFIG:Release>:${crowcpp-crow_INCLUDE_DIRS_RELEASE}>)
    # Necessary to find LINK shared libraries in Linux
    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_LINK_DIRECTORIES
                 $<$<CONFIG:Release>:${crowcpp-crow_LIB_DIRS_RELEASE}>)
    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_COMPILE_DEFINITIONS
                 $<$<CONFIG:Release>:${crowcpp-crow_COMPILE_DEFINITIONS_RELEASE}>)
    set_property(TARGET Crow::Crow
                 APPEND PROPERTY INTERFACE_COMPILE_OPTIONS
                 $<$<CONFIG:Release>:${crowcpp-crow_COMPILE_OPTIONS_RELEASE}>)

########## For the modules (FindXXX)
set(crowcpp-crow_LIBRARIES_RELEASE Crow::Crow)
