# The following lines of boilerplate have to be in your project's
# CMakeLists.txt in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.16)

# Include build system from ESP-IDF
include($ENV{IDF_PATH}/tools/cmake/project.cmake)

# Create a project
project(esp32_dht11_sensor)
