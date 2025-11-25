import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type OdfDocumentDocument = HydratedDocument<OdfDocumentEntity>;

@Schema({
  timestamps: true,
  collection: "odf_documents",
})
export class OdfDocumentEntity {
  @Prop({
    type: String,
    index: true,
  })
  competitionCode!: string;

  @Prop({ required: true })
  documentCode!: string;

  @Prop({ required: true })
  documentType!: string;

  @Prop({ required: false })
  documentSubtype?: string;

  @Prop({ required: true })
  version!: string;

  @Prop({ required: true })
  date!: Date;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: false })
  resultStatus?: string;

  @Prop({ type: [String], required: false })
  unitCodes?: string[];

  @Prop({
    type: String,
    required: false,
    index: true,
    unique: true,
    sparse: true,
  })
  contentHash?: string;
}

export const OdfDocumentSchema =
  SchemaFactory.createForClass(OdfDocumentEntity);

