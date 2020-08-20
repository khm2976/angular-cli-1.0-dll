/**
 * AOT 빌드를 위해 Application 내에서 파일을 참조합니다.
 *
 * @alias ~env
 * @author foundy
 * @since 2020.05.08
 */
import { environment as rootEnvironment } from '../../../environments/environment';

export const environment = {
  ...rootEnvironment,
  // 확장 필요시 추가
};
