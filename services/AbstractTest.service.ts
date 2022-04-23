import { Subject } from "rxjs";
export abstract class AbstractTestService {
  private currentVm = new Subject<void>();
  start() {}
  stop() {}
  init() {}
  getVm() {}
}
