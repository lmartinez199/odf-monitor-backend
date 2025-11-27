import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type DisciplineSettingsDocument = HydratedDocument<DisciplineSettingsEntity>;

@Schema({
  timestamps: true,
  collection: "discipline-settings",
})
export class DisciplineSettingsEntity {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({
    type: {
      discipline: String,
      rscCode: String,
    },
    required: false,
  })
  metadata?: {
    discipline: string;
    rscCode: string;
  };

  @Prop({
    type: {
      startDate: Date,
      endDate: Date,
    },
    required: false,
  })
  dateInfo?: {
    startDate: Date;
    endDate: Date;
  };

  @Prop({
    type: {
      eng: {
        long: String,
        short: String,
      },
      fra: {
        long: String,
        short: String,
      },
      ara: {
        long: String,
        short: String,
      },
    },
    required: false,
  })
  description?: {
    eng?: {
      long?: string;
      short?: string;
    };
    fra?: {
      long?: string;
      short?: string;
    };
    ara?: {
      long?: string;
      short?: string;
    };
  };
}

export const DisciplineSettingsSchema = SchemaFactory.createForClass(DisciplineSettingsEntity);

// Índices para optimizar búsquedas de disciplinas
DisciplineSettingsSchema.index({ name: 1 }); // Para búsqueda rápida por nombre
DisciplineSettingsSchema.index({ "metadata.discipline": 1 }); // Para búsqueda por metadata.discipline
