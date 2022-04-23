import { Subject } from "rxjs";
import { AbstractTestService } from "./AbstractTest.service";

// const isCurResponseTestRunning$ = new Subject<void>();
// const isCurDownloadTestRunning$ = new Subject<void>();

// function stopCurResponseTest() {
//   isCurResponseTestRunning$.next();
//   isCurResponseTestRunning$.complete();
// }
// function stopCurDownloadTest() {
//   isCurDownloadTestRunning$.next();
//   isCurDownloadTestRunning$.complete();
// }

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
