// Heuristic converter: turns plain, unformatted CV text (e.g. pasted from a
// Google Doc/Word file) into the markdown structure expected by the CV
// renderer (src/app/cv/page.tsx `parseCv`): `# Name`, tagline line, contact
// line, `## Section` headings, `### Company/Project` sub-headings and `- `
// bullet lists.

const SECTION_KEYWORDS = [
  "resumo profissional", "resumo", "objetivo", "perfil profissional", "sobre mim",
  "competencias tecnicas", "competencias", "habilidades", "skills",
  "experiencia profissional", "experiencia",
  "formacao academica", "formacao", "educacao",
  "diferenciais",
  "projetos relevantes", "projetos",
  "certificacoes", "certificados",
  "idiomas", "languages",
  "cursos complementares", "cursos",
  "contato",
];

const BULLET_RE = /^(?:[●•▪‣◦∙]\s*|[-*]\s+)/;
const DATE_RANGE_RE =
  /^[A-Za-zÀ-ÿ]{3,12}\.?\/?\s?\d{2,4}\s*[-–—]\s*([A-Za-zÀ-ÿ]{3,12}\.?\/?\s?\d{2,4}|Atual|Presente|Hoje|Present|Current)\.?$/i;
const PAREN_END_RE = /\([^()]+\)\s*$/;
const CONTACT_RE = /@|https?:\/\//i;
const CONTACT_LABEL_RE = /(linkedin|github|portf[oó]lio|email|e-mail|telefone|celular|site|website)/i;
const CONTACT_LABEL_BOLD_RE = /(LinkedIn|GitHub|Portf[oó]lio|E-?mail|Telefone|Celular|Site|Website)\s*:/gi;

const stripAccents = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");

export function autoFormatCv(raw: string): string {
  const lines = raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return raw;

  const isBullet = (l: string) => BULLET_RE.test(l);
  const stripBullet = (l: string) => l.replace(BULLET_RE, "").trim();
  const isSectionHeading = (l: string) => {
    if (isBullet(l) || l.length > 45 || /[.:]$/.test(l)) return false;
    const norm = stripAccents(l).toLowerCase().trim();
    return SECTION_KEYWORDS.includes(norm);
  };
  const looksLikeContact = (l: string) => CONTACT_RE.test(l) || (l.includes("|") && CONTACT_LABEL_RE.test(l));
  const endsWithColon = (l: string) => /:$/.test(l);
  const isCompanyBlockStart = (idx: number) =>
    idx + 2 < lines.length &&
    !isBullet(lines[idx + 1]) &&
    !isSectionHeading(lines[idx + 1]) &&
    DATE_RANGE_RE.test(lines[idx + 2]);
  const isStandaloneTitleStart = (idx: number) => {
    const l = lines[idx];
    const next = lines[idx + 1];
    return (
      l.length < 70 &&
      !/\.$/.test(l) &&
      !!next &&
      !isBullet(next) &&
      !isSectionHeading(next) &&
      !DATE_RANGE_RE.test(next) &&
      next.length > l.length
    );
  };

  const out: string[] = [];
  let i = 0;

  // Name
  out.push(`# ${lines[i]}`);
  i++;

  // Tagline (optional)
  if (i < lines.length && !isSectionHeading(lines[i]) && !isBullet(lines[i]) && !looksLikeContact(lines[i])) {
    out.push(lines[i]);
    i++;
  }

  // Contact line (optional)
  if (i < lines.length && looksLikeContact(lines[i])) {
    out.push(lines[i].replace(CONTACT_LABEL_BOLD_RE, (m) => `**${m}**`));
    i++;
  }

  out.push("");

  while (i < lines.length) {
    const line = lines[i];

    // Section heading
    if (isSectionHeading(line)) {
      if (out[out.length - 1] !== "") out.push("");
      out.push(`## ${line}`);
      out.push("");
      i++;
      continue;
    }

    // Bulleted item — merge wrapped continuation lines, detect sub-lines
    // like "Institution (year)" that follow a degree bullet.
    if (isBullet(line)) {
      let content = stripBullet(line);
      let j = i + 1;
      let subline: string | null = null;
      while (
        j < lines.length &&
        !isBullet(lines[j]) &&
        !isSectionHeading(lines[j]) &&
        !DATE_RANGE_RE.test(lines[j]) &&
        !endsWithColon(lines[j]) &&
        !isCompanyBlockStart(j)
      ) {
        if (content.length < 55 && PAREN_END_RE.test(lines[j])) {
          subline = lines[j];
          j++;
          break;
        }
        if (isStandaloneTitleStart(j)) break;
        content = `${content} ${lines[j]}`;
        j++;
      }
      if (subline) {
        out.push(`- **${content}**  `);
        out.push(`  ${subline}`);
      } else {
        out.push(`- ${content}`);
      }
      i = j;
      continue;
    }

    // Company / role / date-range block ("Verzel" / "Dev Full Stack" / "Nov/2025 - Atual")
    if (isCompanyBlockStart(i)) {
      if (out[out.length - 1] !== "") out.push("");
      out.push(`### ${line}`);
      out.push("");
      out.push(`**${lines[i + 1]}**  `);
      out.push(`**${lines[i + 2]}**`);
      out.push("");
      i += 3;
      continue;
    }

    // Short label line ending in ":" (e.g. "Principais funcionalidades:")
    if (endsWithColon(line) && line.length < 60) {
      out.push(`**${line}**`);
      i++;
      continue;
    }

    // Standalone short title followed by a longer paragraph -> sub-heading
    if (isStandaloneTitleStart(i)) {
      if (out[out.length - 1] !== "") out.push("");
      out.push(`### ${line}`);
      out.push("");
      i++;
      continue;
    }

    // Default: prose paragraph — merge wrapped lines until a structural marker
    let para = line;
    let k = i + 1;
    while (
      k < lines.length &&
      !isBullet(lines[k]) &&
      !isSectionHeading(lines[k]) &&
      !DATE_RANGE_RE.test(lines[k]) &&
      !endsWithColon(lines[k]) &&
      !isCompanyBlockStart(k) &&
      !isStandaloneTitleStart(k)
    ) {
      para = `${para} ${lines[k]}`;
      k++;
    }
    out.push(para);
    out.push("");
    i = k;
  }

  return out
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}
