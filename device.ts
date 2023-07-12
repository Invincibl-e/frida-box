import { getDeviceManager, Device, DeviceType } from 'frida';

import { RunArgs } from "./args.js";


export async function filterDevice ( args: RunArgs )
{
	let deviceManager = getDeviceManager ()
	if ( args.remote )
	{
		await deviceManager.addRemoteDevice ( args.remote )
	}

	let devices = await getDeviceManager().enumerateDevices()

	let type = DeviceType.Local
	if ( args.remote ) {
		type = DeviceType.Remote
	}
	else if ( args.usb ) {
		type = DeviceType.Usb
	}

	return devices.filter( device =>
	{
		if ( device.type === type )
		{
			return args.device === undefined || args.device === device.id
		}
	} )
}