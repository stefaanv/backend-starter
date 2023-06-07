import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core'

@Entity()
export class Bijaanvraag {
  [OptionalProps]?:
    | 'aanvraag'
    | 'aanvraagdatum'
    | 'aanvragernaam'
    | 'aanvragervoornaam'
    | 'code'
    | 'geprint'
    | 'gewicht'
    | 'kopij'
    | 'locatie'
    | 'patientnaam'
    | 'patientvoornaam'
    | 'tijdstip'

  @PrimaryKey()
  bijaanvraagid!: number

  @Property({ default: '0000-00-00 00:00:00' })
  tijdstip!: Date

  @Property({ length: 10, default: '' })
  code!: string

  @Property({ length: 50, default: '' })
  aanvragernaam!: string

  @Property({ length: 50, default: '' })
  aanvragervoornaam!: string

  @Property({ length: 50, default: '' })
  locatie!: string

  @Property({ default: '0000-00-00 00:00:00' })
  geprint!: Date

  @Property({ length: 50, default: '' })
  patientnaam!: string

  @Property({ length: 50, default: '' })
  patientvoornaam!: string

  @Property({ length: 20, default: '' })
  aanvraag!: string

  @Property({ columnType: 'date', default: '0000-00-00' })
  aanvraagdatum!: string

  @Property({ columnType: 'text', length: 65535 })
  opmerkingen!: string

  @Property({ length: 100, default: '' })
  kopij!: string

  @Property({ length: 20, default: '' })
  gewicht!: string

  @Property({ columnType: 'text', length: 65535 })
  analyses!: string

  @Property({ columnType: 'text', length: 65535 })
  andere!: string
}
