import { BeadColor } from '@/types';

// 标准 Perler 221色卡
const beadColorData: { code: string; name: string; hex: string }[] = [
  // A列 - 26色
  { code: 'A1', name: 'Cream', hex: '#FAF4C8' },
  { code: 'A2', name: 'Antique White', hex: '#FFFFD5' },
  { code: 'A3', name: 'Glow Yellow', hex: '#FEFF88' },
  { code: 'A4', name: 'Lemon', hex: '#FBED56' },
  { code: 'A5', name: 'Sunflower', hex: '#F4D738' },
  { code: 'A6', name: 'Yellow', hex: '#FEAC4C' },
  { code: 'A7', name: 'Orange', hex: '#FE8B4C' },
  { code: 'A8', name: 'Blonde', hex: '#FFDA45' },
  { code: 'A9', name: 'Butterscotch', hex: '#FE9958' },
  { code: 'A10', name: 'Red', hex: '#F77C31' },
  { code: 'A11', name: 'Pastel Peach', hex: '#FFDD99' },
  { code: 'A12', name: 'Coral', hex: '#FE9F72' },
  { code: 'A13', name: 'Pumpkin', hex: '#FFC365' },
  { code: 'A14', name: 'Racing Red', hex: '#FD543D' },
  { code: 'A15', name: 'Cheese', hex: '#FFF365' },
  { code: 'A16', name: 'Banana', hex: '#FFFF9F' },
  { code: 'A17', name: 'Yellow Orange', hex: '#FFE36E' },
  { code: 'A18', name: 'Tangerine', hex: '#FEBE7D' },
  { code: 'A19', name: 'Watermelon', hex: '#FD7C72' },
  { code: 'A20', name: 'Light Peach', hex: '#FFD568' },
  { code: 'A21', name: 'Peach', hex: '#FFE395' },
  { code: 'A22', name: 'Yellow Green', hex: '#F4F57D' },
  { code: 'A23', name: 'Light Brown', hex: '#E6C9B7' },
  { code: 'A24', name: 'Pale Yellow', hex: '#F7F8A2' },
  { code: 'A25', name: 'Sand', hex: '#FFD67D' },
  { code: 'A26', name: 'Amber', hex: '#FFC830' },
  
  // B列 - 32色
  { code: 'B1', name: 'Chartreuse', hex: '#E6EE31' },
  { code: 'B2', name: 'Bright Green', hex: '#63F347' },
  { code: 'B3', name: 'Parrot Green', hex: '#9EF780' },
  { code: 'B4', name: 'Green', hex: '#5DE035' },
  { code: 'B5', name: 'Kiwi Lime', hex: '#35E352' },
  { code: 'B6', name: 'Mint Green', hex: '#65E2A6' },
  { code: 'B7', name: 'Evergreen', hex: '#3DAF80' },
  { code: 'B8', name: 'Forest Green', hex: '#1C9C4F' },
  { code: 'B9', name: 'Dark Green', hex: '#27523A' },
  { code: 'B10', name: 'Teal', hex: '#95D3C2' },
  { code: 'B11', name: 'Olive Green', hex: '#5D722A' },
  { code: 'B12', name: 'Dark Olive', hex: '#166F41' },
  { code: 'B13', name: 'Spring Green', hex: '#CAEB7B' },
  { code: 'B14', name: 'Limeade', hex: '#ADE946' },
  { code: 'B15', name: 'Dark Forest', hex: '#2E5132' },
  { code: 'B16', name: 'Sea Green', hex: '#C5ED9C' },
  { code: 'B17', name: 'Avocado Green', hex: '#9BB13A' },
  { code: 'B18', name: 'Lemon Lime', hex: '#E6EE49' },
  { code: 'B19', name: 'Turquoise', hex: '#24B88C' },
  { code: 'B20', name: 'Celadon', hex: '#C2F0CC' },
  { code: 'B21', name: 'Ocean Teal', hex: '#156A6B' },
  { code: 'B22', name: 'Deep Teal', hex: '#0B3C43' },
  { code: 'B23', name: 'Army Green', hex: '#303A21' },
  { code: 'B24', name: 'Light Lime', hex: '#EEFCA5' },
  { code: 'B25', name: 'Slate Green', hex: '#4E846D' },
  { code: 'B26', name: 'Military Green', hex: '#8D7A35' },
  { code: 'B27', name: 'Sage Green', hex: '#CCE1AF' },
  { code: 'B28', name: 'Moss Green', hex: '#9EE5B9' },
  { code: 'B29', name: 'Pickle Green', hex: '#C5E254' },
  { code: 'B30', name: 'Light Mint', hex: '#E2FCB1' },
  { code: 'B31', name: 'Light Green', hex: '#B0E792' },
  { code: 'B32', name: 'Fern Green', hex: '#9CAB5A' },
  
  // C列 - 29色
  { code: 'C1', name: 'Pale Cyan', hex: '#E8FFE7' },
  { code: 'C2', name: 'Ice Blue', hex: '#A9F9FC' },
  { code: 'C3', name: 'Light Blue', hex: '#A0E2FB' },
  { code: 'C4', name: 'Sky', hex: '#41CCFF' },
  { code: 'C5', name: 'Cyan', hex: '#01ACE8' },
  { code: 'C6', name: 'Blueberry', hex: '#50AAF0' },
  { code: 'C7', name: 'Blue', hex: '#3677D2' },
  { code: 'C8', name: 'Dark Blue', hex: '#0F54C0' },
  { code: 'C9', name: 'Royal Blue', hex: '#324BCA' },
  { code: 'C10', name: 'Cerulean', hex: '#3EBCE2' },
  { code: 'C11', name: 'Turquoise Blue', hex: '#28DDDE' },
  { code: 'C12', name: 'Navy Blue', hex: '#1C334D' },
  { code: 'C13', name: 'Cornflower', hex: '#CDE8FF' },
  { code: 'C14', name: 'Baby Blue', hex: '#D5FDFF' },
  { code: 'C15', name: 'Peacock Blue', hex: '#22C4C6' },
  { code: 'C16', name: 'Deep Blue', hex: '#1557A8' },
  { code: 'C17', name: 'Bright Blue', hex: '#04D1F6' },
  { code: 'C18', name: 'Night Blue', hex: '#1D3344' },
  { code: 'C19', name: 'Ocean Blue', hex: '#1887A2' },
  { code: 'C20', name: 'Medium Blue', hex: '#176DAF' },
  { code: 'C21', name: 'Periwinkle', hex: '#BEDDFF' },
  { code: 'C22', name: 'Blue Green', hex: '#67B4BE' },
  { code: 'C23', name: 'Pale Blue', hex: '#C8E2FF' },
  { code: 'C24', name: 'Light Periwinkle', hex: '#7CC4FF' },
  { code: 'C25', name: 'Robin Egg', hex: '#A9E5E5' },
  { code: 'C26', name: 'Teal Blue', hex: '#3CAED8' },
  { code: 'C27', name: 'Lavender Blue', hex: '#D3DFFA' },
  { code: 'C28', name: 'Cloudy Blue', hex: '#BBCFED' },
  { code: 'C29', name: 'Dark Periwinkle', hex: '#34488E' },
  
  // D列 - 26色
  { code: 'D1', name: 'Light Lavender', hex: '#AEB4F2' },
  { code: 'D2', name: 'Lavender', hex: '#858EDD' },
  { code: 'D3', name: 'Purple Blue', hex: '#2F54AF' },
  { code: 'D4', name: 'Dark Purple Blue', hex: '#182A84' },
  { code: 'D5', name: 'Hot Pink', hex: '#B843C5' },
  { code: 'D6', name: 'Plum', hex: '#AC7BDE' },
  { code: 'D7', name: 'Purple', hex: '#8854B3' },
  { code: 'D8', name: 'Light Purple', hex: '#E2D3FF' },
  { code: 'D9', name: 'Pale Purple', hex: '#D5B9F8' },
  { code: 'D10', name: 'Dark Plum', hex: '#361851' },
  { code: 'D11', name: 'Orchid', hex: '#B9BAE1' },
  { code: 'D12', name: 'Pink Purple', hex: '#DE9AD4' },
  { code: 'D13', name: 'Magenta', hex: '#B90095' },
  { code: 'D14', name: 'Dark Magenta', hex: '#8B279B' },
  { code: 'D15', name: 'Deep Purple', hex: '#2F1F90' },
  { code: 'D16', name: 'Pale Lilac', hex: '#E3E1EE' },
  { code: 'D17', name: 'Light Lilac', hex: '#C4D4F6' },
  { code: 'D18', name: 'Lilac', hex: '#A45EC7' },
  { code: 'D19', name: 'Mauve', hex: '#D8C3D7' },
  { code: 'D20', name: 'Violet', hex: '#9C32B2' },
  { code: 'D21', name: 'Grape', hex: '#9A009B' },
  { code: 'D22', name: 'Eggplant', hex: '#333A95' },
  { code: 'D23', name: 'Lavender Mist', hex: '#EBD4FC' },
  { code: 'D24', name: 'Wisteria', hex: '#7786E5' },
  { code: 'D25', name: 'Amethyst', hex: '#494FC7' },
  { code: 'D26', name: 'Orchid Purple', hex: '#DFC2F8' },
  
  // E列 - 24色
  { code: 'E1', name: 'Blush', hex: '#FDD3CC' },
  { code: 'E2', name: 'Light Pink', hex: '#FEC0DF' },
  { code: 'E3', name: 'Bubblegum', hex: '#FF87E7' },
  { code: 'E4', name: 'Pink', hex: '#E8649E' },
  { code: 'E5', name: 'Hot Pink', hex: '#F551A2' },
  { code: 'E6', name: 'Raspberry', hex: '#F13074' },
  { code: 'E7', name: 'Cranberry', hex: '#C63478' },
  { code: 'E8', name: 'Rose', hex: '#FFDBE9' },
  { code: 'E9', name: 'Fuchsia', hex: '#E970CC' },
  { code: 'E10', name: 'Magenta Pink', hex: '#D33793' },
  { code: 'E11', name: 'Pink Beige', hex: '#FCDDD2' },
  { code: 'E12', name: 'Pastel Pink', hex: '#F78FC3' },
  { code: 'E13', name: 'Deep Magenta', hex: '#B5006D' },
  { code: 'E14', name: 'Coral Pink', hex: '#FFD18A' },
  { code: 'E15', name: 'Light Rose', hex: '#F8C7C9' },
  { code: 'E16', name: 'Antique Pink', hex: '#FFF3EB' },
  { code: 'E17', name: 'Pink Salmon', hex: '#FFE2EA' },
  { code: 'E18', name: 'Salmon Pink', hex: '#FFC7DB' },
  { code: 'E19', name: 'Light Coral', hex: '#FEBAD5' },
  { code: 'E20', name: 'Mauve Pink', hex: '#D8C7D1' },
  { code: 'E21', name: 'Rose Beige', hex: '#8D90A1' },
  { code: 'E22', name: 'Dusty Rose', hex: '#B785A1' },
  { code: 'E23', name: 'Mauve Taupe', hex: '#937A8D' },
  { code: 'E24', name: 'Dusty Purple', hex: '#E1BCE8' },
  
  // F列 - 25色
  { code: 'F1', name: 'Terracotta', hex: '#F2785A' },
  { code: 'F2', name: 'Red', hex: '#F2332E' },
  { code: 'F3', name: 'Cherry', hex: '#F22833' },
  { code: 'F4', name: 'Scarlet', hex: '#F22030' },
  { code: 'F5', name: 'Ruby', hex: '#F21833' },
  { code: 'F6', name: 'Garnet', hex: '#A63D3A' },
  { code: 'F7', name: 'Mahogany', hex: '#A63633' },
  { code: 'F8', name: 'Wine', hex: '#A62C33' },
  { code: 'F9', name: 'Rose Red', hex: '#F25E57' },
  { code: 'F10', name: 'Brown Red', hex: '#A63C26' },
  { code: 'F11', name: 'Dark Red', hex: '#A62525' },
  { code: 'F12', name: 'Hot Red', hex: '#F24D5A' },
  { code: 'F13', name: 'Burnt Orange', hex: '#F2632E' },
  { code: 'F14', name: 'Pastel Red', hex: '#F26562' },
  { code: 'F15', name: 'Christmas Red', hex: '#F21330' },
  { code: 'F16', name: 'Light Red', hex: '#F2685A' },
  { code: 'F17', name: 'Reddish Brown', hex: '#A64526' },
  { code: 'F18', name: 'Rust', hex: '#A65526' },
  { code: 'F19', name: 'Tomato Red', hex: '#F23926' },
  { code: 'F20', name: 'Clay Red', hex: '#A65543' },
  { code: 'F21', name: 'Pink Red', hex: '#F2697A' },
  { code: 'F22', name: 'Pastel Orange', hex: '#F26D5A' },
  { code: 'F23', name: 'Red Orange', hex: '#F26126' },
  { code: 'F24', name: 'Orange Red', hex: '#F24926' },
  { code: 'F25', name: 'Deep Red', hex: '#F22B26' },
  
  // G列 - 21色
  { code: 'G1', name: 'Peach Beige', hex: '#F2C7A6' },
  { code: 'G2', name: 'Light Peach', hex: '#F2B896' },
  { code: 'G3', name: 'Nude', hex: '#F2A88A' },
  { code: 'G4', name: 'Tan', hex: '#F2997A' },
  { code: 'G5', name: 'Golden', hex: '#F2B433' },
  { code: 'G6', name: 'Yellow Ochre', hex: '#F2A526' },
  { code: 'G7', name: 'Brown', hex: '#A66A33' },
  { code: 'G8', name: 'Dark Brown', hex: '#A65A26' },
  { code: 'G9', name: 'Caramel', hex: '#F28A33' },
  { code: 'G10', name: 'Light Brown', hex: '#A67A33' },
  { code: 'G11', name: 'Coffee', hex: '#A65826' },
  { code: 'G12', name: 'Mustard', hex: '#F2A433' },
  { code: 'G13', name: 'Hazel', hex: '#A66826' },
  { code: 'G14', name: 'Burnt Brown', hex: '#A65026' },
  { code: 'G15', name: 'Sand Beige', hex: '#F2D7A6' },
  { code: 'G16', name: 'Light Tan', hex: '#F2C896' },
  { code: 'G17', name: 'Golden Brown', hex: '#A66526' },
  { code: 'G18', name: 'Cream Beige', hex: '#F2E7D6' },
  { code: 'G19', name: 'Orange Brown', hex: '#F27A26' },
  { code: 'G20', name: 'Chocolate', hex: '#A64A26' },
  { code: 'G21', name: 'Teddy Bear', hex: '#F2B7A6' },
  
  // H列 - 23色
  { code: 'H1', name: 'White', hex: '#FFFFFF' },
  { code: 'H2', name: 'Light Grey', hex: '#E0E0E0' },
  { code: 'H3', name: 'Grey', hex: '#A0A0A0' },
  { code: 'H4', name: 'Dark Grey', hex: '#707070' },
  { code: 'H5', name: 'Light Black', hex: '#404040' },
  { code: 'H6', name: 'Black', hex: '#000000' },
  { code: 'H7', name: 'True Black', hex: '#000000' },
  { code: 'H8', name: 'Pale Grey', hex: '#F0F0F0' },
  { code: 'H9', name: 'Silver', hex: '#D0D0D0' },
  { code: 'H10', name: 'Metallic Silver', hex: '#B0B0B0' },
  { code: 'H11', name: 'Ash Grey', hex: '#909090' },
  { code: 'H12', name: 'Charcoal', hex: '#505050' },
  { code: 'H13', name: 'Light Charcoal', hex: '#606060' },
  { code: 'H14', name: 'Off White', hex: '#F8F8F8' },
  { code: 'H15', name: 'Smoke', hex: '#808080' },
  { code: 'H16', name: 'Dark Smoke', hex: '#303030' },
  { code: 'H17', name: 'Cloud White', hex: '#F5F5F5' },
  { code: 'H18', name: 'Warm Grey', hex: '#E8E8E8' },
  { code: 'H19', name: 'Cool Grey', hex: '#E0E0E8' },
  { code: 'H20', name: 'Slate', hex: '#707080' },
  { code: 'H21', name: 'Cream White', hex: '#FFFFF0' },
  { code: 'H22', name: 'Light Slate', hex: '#9090A0' },
  { code: 'H23', name: 'Dark Slate', hex: '#404050' },
  
  // M列 - 15色
  { code: 'M1', name: 'Warm Beige', hex: '#E0D8C8' },
  { code: 'M2', name: 'Drab', hex: '#B0A898' },
  { code: 'M3', name: 'Khaki', hex: '#908878' },
  { code: 'M4', name: 'Sand Tan', hex: '#E0D0B8' },
  { code: 'M5', name: 'Taupe', hex: '#A09080' },
  { code: 'M6', name: 'Dark Taupe', hex: '#706050' },
  { code: 'M7', name: 'Brown Grey', hex: '#504030' },
  { code: 'M8', name: 'Mauve Brown', hex: '#B08090' },
  { code: 'M9', name: 'Dusty Taupe', hex: '#908070' },
  { code: 'M10', name: 'Warm Taupe', hex: '#A09080' },
  { code: 'M11', name: 'Plum Taupe', hex: '#907080' },
  { code: 'M12', name: 'Deep Taupe', hex: '#605040' },
  { code: 'M13', name: 'Bronze', hex: '#C08040' },
  { code: 'M14', name: 'Copper', hex: '#D09060' },
  { code: 'M15', name: 'Dark Bronze', hex: '#705030' },
];

// RGB 转 Lab
const rgbToLab = (r: number, g: number, blue: number): { l: number; a: number; b: number } => {
  let rn = r / 255;
  let gn = g / 255;
  let bn = blue / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  let x = rn * 0.4124 + gn * 0.3576 + bn * 0.1805;
  let y = rn * 0.2126 + gn * 0.7152 + bn * 0.0722;
  let z = rn * 0.0193 + gn * 0.1192 + bn * 0.9505;

  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return { l, a, b };
};

// HEX 转 RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

// 生成完整色库
export const beadColors: BeadColor[] = beadColorData.map(color => {
  const rgb = hexToRgb(color.hex);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  return {
    code: color.code,
    name: color.name,
    hex: color.hex,
    rgb,
    lab,
  };
});
