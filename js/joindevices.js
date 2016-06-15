var joindevices = {    
    "groups":{
        "DeviceGroup" : function(id, name){
            this.id = id;
            this.name = name;
            this.devices = [];
        },
        "DeviceGroups" : function(){
            var me = this;
            this.allDeviceGroups = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_ANDROID,joindevices.DEVICE_GROUP_CHROME,joindevices.DEVICE_GROUP_WINDOWS10,joindevices.DEVICE_GROUP_FIREFOX,joindevices.DEVICE_GROUP_PHONE,joindevices.DEVICE_GROUP_TABLET,joindevices.DEVICE_GROUP_PC];
            this.androidGroups = [joindevices.DEVICE_GROUP_ANDROID,joindevices.DEVICE_GROUP_PHONE,joindevices.DEVICE_GROUP_TABLET];
            this.deviceTypeGroups = {};

            this.deviceTypeGroups[joindevices.DEVICE_TYPE_ANDROID_PHONE] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_ANDROID,joindevices.DEVICE_GROUP_PHONE];
            this.deviceTypeGroups[joindevices.DEVICE_TYPE_ANDROID_TABLET] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_ANDROID,joindevices.DEVICE_GROUP_TABLET];
            this.deviceTypeGroups[joindevices.DEVICE_TYPE_CHROME_BROWSER] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_CHROME,joindevices.DEVICE_GROUP_PC];
            this.deviceTypeGroups[joindevices.DEVICE_TYPE_WIDNOWS_PC] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_WINDOWS10,joindevices.DEVICE_GROUP_PC];
            this.deviceTypeGroups[joindevices.DEVICE_TYPE_FIREFOX] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_FIREFOX,joindevices.DEVICE_GROUP_PC];
            this.deviceTypeGroups[joindevices.DEVICE_TYPE_ANDROID_TV] = [joindevices.DEVICE_GROUP_ALL,joindevices.DEVICE_GROUP_ANDROID];
            this.putDevicesIntoGroups = function(devices){
                //Group devices into groups
                for (var i = 0; i < this.allDeviceGroups.length; i++) {
                    var deviceGroup = this.allDeviceGroups[i];
                    deviceGroup.devices = devices.where(function(device){
                        return device.deviceType != joindevices.DEVICE_TYPE_GROUP && me.deviceTypeGroups[device.deviceType].indexOf(deviceGroup) >=0;
                    });
                }
                //Check equal groups and remove devices from them
                for (var i = 0; i < this.allDeviceGroups.length; i++) {
                    var deviceGroup = this.allDeviceGroups[i];
                    var otherGroupsThatAreTheSame = this.allDeviceGroups.where(function(deviceGroupToSearch){
                        return deviceGroupToSearch != deviceGroup && deviceGroupToSearch.devices.equalsArrayAnyOrder(deviceGroup.devices);
                    });
                    otherGroupsThatAreTheSame.doForAll(function(groupToRemoveDevices){
                        groupToRemoveDevices.devices = [];
                    });
                }
                //console.log(me.allDeviceGroups);
                //
                /*for (var groupId in deviceGroupsToCreate) {
                    var devicesForGroup = deviceGroupsToCreate[groupId];
                }*/
            }
            this.getGroups = function(devices){
                this.putDevicesIntoGroups(devices);
                return this.allDeviceGroups.where(function(deviceGroup){
                    return deviceGroup.devices.length > 1;
                });
            }
            this.GROUP_PREFIX = "group.";
            this.getGroupDevices = function(devices, groupId){
                if(groupId == null){
                    return [];
                }
                if(groupId.indexOf(this.GROUP_PREFIX)==0){
                    groupId = groupId.substring(this.GROUP_PREFIX.length);
                }
                this.putDevicesIntoGroups(devices);
                var group = this.allDeviceGroups.first(function(deviceGroup){
                    return deviceGroup.id == groupId;
                });
                if(!group){
                    return [];
                }
                return group.devices;
            }

        }
    }
};
joindevices.DEVICE_TYPE_ANDROID_PHONE = 1;
joindevices.DEVICE_TYPE_ANDROID_TABLET = 2;
joindevices.DEVICE_TYPE_CHROME_BROWSER = 3;
joindevices.DEVICE_TYPE_WIDNOWS_PC = 4;
joindevices.DEVICE_TYPE_FIREFOX = 6;
joindevices.DEVICE_TYPE_GROUP = 7;
joindevices.DEVICE_TYPE_ANDROID_TV = 8;
joindevices.DEVICE_GROUP_ALL = new joindevices.groups.DeviceGroup("all","All");
joindevices.DEVICE_GROUP_ANDROID = new joindevices.groups.DeviceGroup("android","Androids");
joindevices.DEVICE_GROUP_CHROME = new joindevices.groups.DeviceGroup("chrome","Chromes");
joindevices.DEVICE_GROUP_WINDOWS10 = new joindevices.groups.DeviceGroup("windows10", "Windows 10s");
joindevices.DEVICE_GROUP_FIREFOX = new joindevices.groups.DeviceGroup("firefox", "Firefoxes");
joindevices.DEVICE_GROUP_PHONE = new joindevices.groups.DeviceGroup("phone","Phones");
joindevices.DEVICE_GROUP_TABLET = new joindevices.groups.DeviceGroup("tablet","Tablets");
joindevices.DEVICE_GROUP_PC = new joindevices.groups.DeviceGroup("pc","PCs");
joindevices.groups.deviceGroups = new joindevices.groups.DeviceGroups();