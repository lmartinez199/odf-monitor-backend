export interface OdfDocumentModelParams {
  _id: string;
  competitionCode: string;
  documentCode: string;
  documentType: string;
  documentSubtype?: string;
  version: string;
  date: Date;
  content: string;
  resultStatus?: string;
  unitCodes?: string[];
  contentHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OdfDocumentModel {
  public readonly _id: string;
  public readonly competitionCode: string;
  public readonly documentCode: string;
  public readonly documentType: string;
  public readonly documentSubtype?: string;
  public readonly version: string;
  public readonly date: Date;
  public readonly content: string;
  public readonly resultStatus?: string;
  public readonly unitCodes?: string[];
  public readonly contentHash?: string;
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(params: OdfDocumentModelParams) {
    this._id = params._id;
    this.competitionCode = params.competitionCode;
    this.documentCode = params.documentCode;
    this.documentType = params.documentType;
    this.documentSubtype = params.documentSubtype;
    this.version = params.version;
    this.date = params.date;
    this.content = params.content;
    this.resultStatus = params.resultStatus;
    this.unitCodes = params.unitCodes;
    this.contentHash = params.contentHash;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}

