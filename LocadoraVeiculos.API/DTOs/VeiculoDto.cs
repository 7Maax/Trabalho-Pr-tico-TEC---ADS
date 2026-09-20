using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.DTOs
{
    public class VeiculoRequestDto
    {
        [Required(ErrorMessage = "O modelo é obrigatório.")]
        [MaxLength(100)]
        public string Modelo { get; set; } = string.Empty;

        [Required(ErrorMessage = "O ano de fabricação é obrigatório.")]
        [Range(1900, 2100, ErrorMessage = "Ano de fabricação inválido.")]
        public int AnoFabricacao { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Quilometragem inválida.")]
        public decimal Quilometragem { get; set; }

        [Required(ErrorMessage = "A placa é obrigatória.")]
        [MaxLength(10)]
        public string Placa { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Cor { get; set; } = string.Empty;

        [Required(ErrorMessage = "O fabricante é obrigatório.")]
        public int FabricanteId { get; set; }

        [Required(ErrorMessage = "A categoria é obrigatória.")]
        public int CategoriaId { get; set; }
    }

    public class VeiculoResponseDto
    {
        public int     Id             { get; set; }
        public string  Modelo         { get; set; } = string.Empty;
        public int     AnoFabricacao  { get; set; }
        public decimal Quilometragem  { get; set; }
        public string  Placa          { get; set; } = string.Empty;
        public string  Cor            { get; set; } = string.Empty;
        public bool    Disponivel     { get; set; }
        public string  Fabricante     { get; set; } = string.Empty;
        public string  Categoria      { get; set; } = string.Empty;
        public decimal ValorDiaria    { get; set; }
    }
}

