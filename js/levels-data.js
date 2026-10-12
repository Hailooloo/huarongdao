// 由 tools/gen-levels.mjs 自动生成，每关均经 BFS 验证可解，optimal 为最少步数
export const RAW_LEVELS = {
 "easy": [
  {
   "state": "VVSVvvSvSHh.Aa.VaaSv",
   "optimal": 3
  },
  {
   "state": "HhS.VVVSvvv.AaVSaavS",
   "optimal": 4
  },
  {
   "state": "V.V.vSvVSHhvSVAaSvaa",
   "optimal": 5
  },
  {
   "state": "HhVS..vSHhHhAaHhaaSS",
   "optimal": 6
  },
  {
   "state": "S..VSSVvHhvSVVAavvaa",
   "optimal": 7
  },
  {
   "state": "SVS.Sv.VHhSvVVAavvaa",
   "optimal": 8
  },
  {
   "state": ".SVSVVvVvv.vAaHhaaSS",
   "optimal": 9
  },
  {
   "state": ".SSV.HhvHhHhAaVSaavS",
   "optimal": 10
  },
  {
   "state": "S.HhHhVSHhv.AaHhaaSS",
   "optimal": 12
  },
  {
   "state": "HhHhVHh.vSS.HhAaSSaa",
   "optimal": 13
  },
  {
   "state": "HhHhHhV.AavSaaSVS.Sv",
   "optimal": 14
  },
  {
   "state": "HhHhVVAavvaaVSS.v.SS",
   "optimal": 15
  },
  {
   "state": "VSVVv.vv.VAaSvaaHhSS",
   "optimal": 16
  },
  {
   "state": "VHhSvVHhSvAaV.aavSS.",
   "optimal": 17
  },
  {
   "state": "VV..vvSSAaVVaavvSSHh",
   "optimal": 18
  },
  {
   "state": "HhHhVVAavvaaS.SSHh.S",
   "optimal": 19
  },
  {
   "state": "HhHhHhSVSAav.aaSSHh.",
   "optimal": 20
  },
  {
   "state": "VHhVvSSvVAaSvaa.HhS.",
   "optimal": 22
  },
  {
   "state": "HhHhAaV.aavSSVSVSv.v",
   "optimal": 23
  },
  {
   "state": "SSHhAaV.aav.VVVSvvvS",
   "optimal": 24
  },
  {
   "state": "HhSVVS.vvAaVSaav.SHh",
   "optimal": 25
  },
  {
   "state": "HhHhSSAaVSaav.Hh.SHh",
   "optimal": 27
  },
  {
   "state": "VVHhvvHhS.Aa.SaaSSHh",
   "optimal": 28
  },
  {
   "state": "SVV.SvvSAaVVaavvHh.S",
   "optimal": 29
  },
  {
   "state": "SSVVHhvvAaHhaaS..HhS",
   "optimal": 30
  }
 ],
 "normal": [
  {
   "state": "SHh.VVAavvaaVSVSv.vS",
   "optimal": 32
  },
  {
   "state": "AaHhaaVS.SvVVVSvvv.S",
   "optimal": 33
  },
  {
   "state": "HhHhHhSSAaVSaav.SHh.",
   "optimal": 34
  },
  {
   "state": "HhSSHh..AaSVaaVvHhvS",
   "optimal": 35
  },
  {
   "state": "AaHhaaSVHhSvHhVS.Sv.",
   "optimal": 36
  },
  {
   "state": "HhAaSVaa.vHh.VHhSvSS",
   "optimal": 37
  },
  {
   "state": "AaHhaaVVV.vvvHhSS.SS",
   "optimal": 38
  },
  {
   "state": "SS.VVHhvvVSS.vAaHhaa",
   "optimal": 39
  },
  {
   "state": "S.HhVSSSv.VVAavvaaHh",
   "optimal": 41
  },
  {
   "state": "HhSVHhSvS..SHhAaHhaa",
   "optimal": 42
  },
  {
   "state": ".V.SVvSVvSVvAavSaaHh",
   "optimal": 43
  },
  {
   "state": "VSAavSaaHhV.VVvSvv.S",
   "optimal": 45
  },
  {
   "state": "SVHhSvVS..vVAaSvaaHh",
   "optimal": 46
  },
  {
   "state": "S..SAaHhaaVSVVvVvvSv",
   "optimal": 47
  },
  {
   "state": "VAaSvaaSV.VSvSvV.Hhv",
   "optimal": 48
  },
  {
   "state": "AaSSaaHhV.SVvVVvSvv.",
   "optimal": 49
  },
  {
   "state": "VHhSvS.SS.AaHhaaHhHh",
   "optimal": 50
  },
  {
   "state": "VSSVvS.vV.HhvSAaHhaa",
   "optimal": 52
  },
  {
   "state": "VSAavSaa.VHhVvSVv.Sv",
   "optimal": 53
  },
  {
   "state": "V.SVvAav.aaSVVHhvvSS",
   "optimal": 54
  },
  {
   "state": "SHhVHhSvSAaV.aavHh.S",
   "optimal": 55
  },
  {
   "state": "AaVVaavv.SSSVVS.vvHh",
   "optimal": 56
  },
  {
   "state": "SSSV.S.vHhAaHhaaHhHh",
   "optimal": 57
  },
  {
   "state": "SVAaSvaa.VHh.vSSHhHh",
   "optimal": 58
  },
  {
   "state": "..VSHhvSAaHhaaHhHhSS",
   "optimal": 60
  }
 ],
 "hard": [
  {
   "state": "AaVVaavvSSHhHhSS..Hh",
   "optimal": 61
  },
  {
   "state": "AaVVaavvSVHhVvSSvS..",
   "optimal": 62
  },
  {
   "state": "AaSSaaVVVVvvvvS.S.Hh",
   "optimal": 65
  },
  {
   "state": "SHh.SS.VAaSvaaVVHhvv",
   "optimal": 67
  },
  {
   "state": "Hh.SSAaVSaavSHh.HhHh",
   "optimal": 68
  },
  {
   "state": "SSAaSVaaVvVVv.vvHh.S",
   "optimal": 69
  },
  {
   "state": "..AaVSaavHhVVSVvvSvS",
   "optimal": 71
  },
  {
   "state": "SVAaVvaav.HhSVVSSvv.",
   "optimal": 72
  },
  {
   "state": "VSAav.aaHhVVVSvvvS.S",
   "optimal": 73
  },
  {
   "state": "VAa.vaaSVHhSvHhS.HhS",
   "optimal": 74
  },
  {
   "state": "SVAaVvaavVHh.vVSSSv.",
   "optimal": 75
  },
  {
   "state": "SAaVVaavvHhVS..vSHhS",
   "optimal": 76
  },
  {
   "state": "SAa.SaaVSHhvS.HhHhHh",
   "optimal": 81
  },
  {
   "state": "AaVVaavvSSVV..vvSHhS",
   "optimal": 84
  },
  {
   "state": "VAa.vaaVHhSvVSV.vSvS",
   "optimal": 85
  },
  {
   "state": ".AaVSaavVHh.vSHhSHhS",
   "optimal": 86
  },
  {
   "state": "AaSSaaHhV.HhvSS.HhHh",
   "optimal": 87
  },
  {
   "state": "VAaSvaa..HhSHhHhHhSS",
   "optimal": 88
  },
  {
   "state": "VAaVvaavVHhVvSSvS..S",
   "optimal": 90,
   "name": "横刀立马"
  },
  {
   "state": "SSAaSVaaVvHhvVSV.v.v",
   "optimal": 91
  },
  {
   "state": "HhSSHhAaS.aaHhSV.Hhv",
   "optimal": 105
  },
  {
   "state": "SVAa.vaaSSHhHhV.HhvS",
   "optimal": 114
  },
  {
   "state": "V.VSvSvSAa.VaaSvHhHh",
   "optimal": 115
  },
  {
   "state": "S.VVAavvaaS.HhSVHhSv",
   "optimal": 116
  },
  {
   "state": "V.AavSaaHhSVSHhvHh.S",
   "optimal": 119
  }
 ]
};
