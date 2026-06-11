/** Lokativ naziva gradova — za prirodne rečenice („u Banjoj Luci", „u Brčkom"). */
const LOKATIV: Record<string, string> = {
  Sarajevo: 'Sarajevu',
  'Banja Luka': 'Banjoj Luci',
  Gradiška: 'Gradišci',
  Bijeljina: 'Bijeljini',
  Doboj: 'Doboju',
  Brčko: 'Brčkom',
}

export const uGradu = (grad: string): string => `u ${LOKATIV[grad] ?? grad}`
