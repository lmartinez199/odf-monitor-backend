import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import {
  DisciplineSettingsDocument,
  DisciplineSettingsEntity,
} from "../entities/discipline-settings.entity";

export class DisciplineSettingsRepository {
  constructor(
    @InjectModel(DisciplineSettingsEntity.name)
    private readonly model: Model<DisciplineSettingsDocument>,
  ) {}

  /**
   * Verifica si una disciplina existe en la colección
   * @param disciplineCode Código de la disciplina (ej: "ATH", "MTI")
   * @returns true si la disciplina existe, false en caso contrario
   */
  async exists(disciplineCode: string): Promise<boolean> {
    const discipline = await this.model
      .findOne({
        $or: [{ name: disciplineCode }, { "metadata.discipline": disciplineCode }],
      })
      .exec();

    return discipline !== null;
  }

  /**
   * Obtiene todas las disciplinas disponibles
   * @returns Lista de códigos de disciplinas disponibles
   */
  async findAllDisciplines(): Promise<string[]> {
    const disciplines = await this.model.find({}, { name: 1, "metadata.discipline": 1 }).exec();

    return disciplines
      .map((doc) => doc.metadata?.discipline || doc.name)
      .filter((code): code is string => Boolean(code))
      .sort();
  }

  /**
   * Obtiene información completa de una disciplina
   * @param disciplineCode Código de la disciplina
   * @returns Documento de la disciplina o null si no existe
   */
  async findByCode(disciplineCode: string): Promise<DisciplineSettingsDocument | null> {
    return this.model
      .findOne({
        $or: [{ name: disciplineCode }, { "metadata.discipline": disciplineCode }],
      })
      .exec();
  }

  /**
   * Verifica qué disciplinas de una lista existen en la colección
   * Optimizado: una sola consulta en lugar de múltiples
   * @param disciplineCodes Lista de códigos de disciplinas a verificar
   * @returns Set con los códigos que existen
   */
  async findExistingDisciplines(disciplineCodes: string[]): Promise<Set<string>> {
    if (disciplineCodes.length === 0) {
      return new Set<string>();
    }

    const disciplines = await this.model
      .find({
        $or: [
          { name: { $in: disciplineCodes } },
          { "metadata.discipline": { $in: disciplineCodes } },
        ],
      })
      .select("name metadata.discipline")
      .lean()
      .exec();

    const existing = new Set<string>();
    for (const doc of disciplines) {
      const code =
        (doc as { name?: string; metadata?: { discipline?: string } }).metadata?.discipline ||
        (doc as { name?: string }).name;
      if (code && typeof code === "string") {
        existing.add(code);
      }
    }

    return existing;
  }
}
