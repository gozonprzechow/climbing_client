export class InputCondition
{
	successLoad: string;
	errorLoad: string;

	constructor(obj: any = null)
	{
		if(obj != null)
		{
			Object.assign(this, obj);
		}
	}
}