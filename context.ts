import { ServerRequest, Response, Status } from './package'
import { Abc } from './abc'

export class Context {
  private _request: ServerRequest
  set request(r: ServerRequest) {
    this._request = r
  }
  get request() {
    return this._request
  }

  private _response: Response
  set response(r: Response) {
    this._response = r
  }
  get response() {
    return this._response
  }

  // private _path: string
  // set path(p: string) {
  //   this._path = p
  // }
  get path() {
    return this.request.url
  }

  private _params: { [key: string]: any }
  set params(p) {
    this._params = p
  }
  get params() {
    return this._params
  }

  private _abc: Abc
  set abc(abc: Abc) {
    this._abc = abc
  }
  get abc() {
    return this._abc
  }

  constructor(r: ServerRequest) {
    this.request = r
    this.response = {}
    this.params = {}
  }

  private writeContentType(v: string) {
    if (!this.response.headers) {
      this.response.headers = new Headers()
    }
    if (!this.response.headers.has('content-type')) {
      this.response.headers.set('content-type', v)
    }
  }

  string(v: string, code = Status.OK) {
    this.writeContentType('text/plain')
    this.response.status = code
    this.response.body = new TextEncoder().encode(v)
  }

  json(v: {}, code = Status.OK) {
    this.writeContentType('application/json')
    this.response.status = code
    this.response.body = new TextEncoder().encode(JSON.stringify(v))
  }

  html(v: string, code = Status.OK) {
    this.writeContentType('text/html')
    this.response.status = code
    this.response.body = new TextEncoder().encode(v)
  }
}
