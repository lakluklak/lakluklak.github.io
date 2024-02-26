
//----- (150348A0) --------------------------------------------------------
unsigned int __stdcall Storm_590(unsigned __int8 *a1)
{
  _BYTE *v1; // esi
  int v2; // eax
  unsigned int v3; // edx
  char *i; // ecx
  char v6; // [esp+4h] [ebp-404h]

  v1 = a1;
  v2 = *a1;
  v3 = 0;
  for ( i = &v6; *v1; ++v3 )
  {
    ++v1;
    if ( v3 >= 1023 )
      break;
    if ( v2 < 'a' ) // (unsigned int)(v2 - 'a') > 0x19 97 + 25 | (unsigned int)(v2 - 97) > 25
    {
      if ( v2 == '/' ) // 47
        v2 = '\\'; // 92
    }
    else
    {
      v2 = v2 - 32;
    }
    *i = v2;
    v2 = (unsigned __int8)*v1;
    ++i;
  }
  *i = 0;
  return sub_15034690((unsigned __int8 *)&v6, v3, 0);
}


//----- (15034690) --------------------------------------------------------
unsigned int __fastcall sub_15034690(unsigned __int8 *a1, unsigned int a2, int a3)
{
  int v3; // esi
  unsigned int v4; // edi
  unsigned int v5; // ebp
  int v6; // ebx
  int v7; // edi
  unsigned int v8; // esi
  int v9; // eax
  unsigned int v10; // edi
  unsigned int v11; // esi
  int v12; // eax
  unsigned int v13; // edi
  unsigned int v14; // esi
  unsigned int v15; // esi
  int v16; // ebx
  unsigned int v17; // edi
  unsigned int v18; // esi
  int v19; // ebx
  unsigned int v20; // edi
  unsigned int v21; // esi
  int v22; // ebx
  unsigned int v24; // [esp+18h] [ebp+4h]

  v3 = a3;
  v4 = -0x61C88647;
  v5 = a2;
  v6 = -0x61C88647;
  if ( a2 >= 12 )
  {
    v24 = a2 / 12;
    do
    {
      v7 = v4 + a1[4] + ((a1[5] + ((a1[6] + (a1[7] << 8)) << 8)) << 8);
      v8 = v3 + a1[8] + ((a1[9] + ((a1[10] + (a1[11] << 8)) << 8)) << 8);
      v9 = (v8 >> 13) ^ (v6 + *a1 + ((a1[1] + ((a1[2] + (a1[3] << 8)) << 8)) << 8) - v8 - v7);
      v10 = (v9 << 8) ^ (v7 - v8 - v9);
      v11 = (v10 >> 13) ^ (v8 - v10 - v9);
      v12 = (v11 >> 12) ^ (v9 - v11 - v10);
      v13 = (v12 << 16) ^ (v10 - v11 - v12);
      v14 = (v13 >> 5) ^ (v11 - v13 - v12);
      v6 = (v14 >> 3) ^ (v12 - v14 - v13);
      v4 = (v6 << 10) ^ (v13 - v14 - v6);
      v3 = (v4 >> 15) ^ (v14 - v4 - v6);
      a1 += 12;
      v5 -= 12;
      --v24;
    }
    while ( v24 );
  }
  v15 = a2 + v3;
  switch ( v5 )
  {
    case 1u:
      goto LABEL_15;
    case 2u:
      goto LABEL_14;
    case 3u:
      goto LABEL_13;
    case 4u:
      goto LABEL_12;
    case 5u:
      goto LABEL_11;
    case 6u:
      goto LABEL_10;
    case 7u:
      goto LABEL_9;
    case 8u:
      goto LABEL_8;
    case 9u:
      goto LABEL_7;
    case 0xAu:
      goto LABEL_6;
    case 0xBu:
      v15 += a1[10] << 24;
LABEL_6:
      v15 += a1[9] << 16;
LABEL_7:
      v15 += a1[8] << 8;
LABEL_8:
      v4 += a1[7] << 24;
LABEL_9:
      v4 += a1[6] << 16;
LABEL_10:
      v4 += a1[5] << 8;
LABEL_11:
      v4 += a1[4];
LABEL_12:
      v6 += a1[3] << 24;
LABEL_13:
      v6 += a1[2] << 16;
LABEL_14:
      v6 += a1[1] << 8;
LABEL_15:
      v6 += a1[0];
      break;
    default:
      break;
  }
  v16 = (v15 >> 13) ^ (v6 - v15 - v4);
  v17 = (v16 << 8) ^ (v4 - v15 - v16);
  v18 = (v17 >> 13) ^ (v15 - v17 - v16);
  v19 = (v18 >> 12) ^ (v16 - v18 - v17);
  v20 = (v19 << 16) ^ (v17 - v18 - v19);
  v21 = (v20 >> 5) ^ (v18 - v20 - v19);
  v22 = (v21 >> 3) ^ (v19 - v21 - v20);
  return (((v22 << 10) ^ (v20 - v21 - v22)) >> 15) ^ (v21 - ((v22 << 10) ^ (v20 - v21 - v22)) - v22);
}
