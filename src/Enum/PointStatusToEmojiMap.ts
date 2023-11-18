import { PointStatusEnum } from './PointStatusEnum';
import { PointStatusEmojiEnum } from './PointStatusEmojiEnum';

export const PointStatusToEmojiMap = {
	[PointStatusEnum.WAIT]: PointStatusEmojiEnum.WAIT,
	[PointStatusEnum.SUCCESS]: PointStatusEmojiEnum.SUCCESS,
	[PointStatusEnum.FAILED]: '',
	[PointStatusEnum.FORGOTTEN]: '',
	[PointStatusEnum.WORK]: PointStatusEmojiEnum.WORK,
};