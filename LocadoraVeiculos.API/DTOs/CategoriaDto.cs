using System.ComponentModel.DataAnnotations;

namespace LocadoraVeiculos.API.DTOs
{
    public class CategoriaRequestDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        [MaxLength(100)]
        public string Nome { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor da diária é obrigatório.")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor da diária deve ser positivo.")]
        public decimal ValorDiaria { get; set; }
    }

    public class CategoriaResponseDto
    {
        public int     Id         { get; set; }
        public string  Nome       { get; set; } = string.Empty;
        public string  Descricao  { get; set; } = string.Empty;
        public decimal ValorDiaria { get; set; }
    }
}

