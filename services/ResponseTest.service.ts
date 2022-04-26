import { Subject } from "rxjs";
import { AbstractTestService } from "./AbstractTest.service";

class ResponseTestService extends AbstractTestService {
  private currentVm$ = new Subject<void>();
  constructor() {
    super();
  }
  init() {
    this.currentVm$ = new Subject<void>();
  }
  getVm() {
    return this.currentVm$;
  }
  start() {
    this.stop();
    this.init();
    return this.currentVm$;
  }
  stop() {
    this.currentVm$.next();
    this.currentVm$.complete();
  }
}

export const responseTestService = new ResponseTestService();
